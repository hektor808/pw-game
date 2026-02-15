import type { EngineConfig, FighterId, FighterState, InputFrame, MatchState, PositionContext } from './types';
import { World } from '../ecs/world';
import { InputBuffer } from '../input/inputBuffer';
import { transitionMatchPhase } from '../match/stateMachine';
import { applyOutcome, evaluateRules } from '../match/rules';
import { chooseAIDecision } from '../ai/aiController';
import { clampToRing } from '../physics/ringPhysics';
import { moveset } from '../data/moveset';

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class GameEngine {
  readonly world = new World();
  readonly inputBuffer = new InputBuffer();
  private rng = seededRandom(1337);

  state: MatchState;

  constructor(private readonly config: EngineConfig) {
    this.state = this.createInitialState();
    this.world.spawn('p1', ['fighter']);
    this.world.spawn('p2', ['fighter', 'ai']);
    this.world.transforms.set('p1', { x: -1.5, y: 1, z: 0, yaw: 0 });
    this.world.transforms.set('p2', { x: 1.5, y: 1, z: 0, yaw: Math.PI });
  }

  pushInput(id: FighterId, frame: InputFrame): void {
    this.inputBuffer.push(id, frame);
  }

  step(): MatchState {
    let nextState = { ...this.state, frame: this.state.frame + 1 };
    if (nextState.phase === 'intro' && nextState.frame > 60) nextState = transitionMatchPhase(nextState, 'bell');
    if (nextState.phase === 'bell' && nextState.frame > 120) nextState = transitionMatchPhase(nextState, 'active');

    if (nextState.phase === 'active') {
      nextState = this.resolveFighterFrame('p1', 'p2', nextState);
      nextState = this.resolveAIOpponent(nextState);
      nextState = this.resolveRingMovement(nextState);
    }

    const outcome = evaluateRules(nextState);
    nextState = applyOutcome(nextState, outcome);
    if (nextState.phase === 'finish') {
      nextState = transitionMatchPhase(nextState, 'result');
    }

    this.state = nextState;
    return this.state;
  }

  private resolveFighterFrame(id: FighterId, opponentId: FighterId, state: MatchState): MatchState {
    const fighter = { ...state.fighters[id] };
    const opponent = { ...state.fighters[opponentId] };
    const action = this.inputBuffer.consumeBufferedAction(id, state.frame);

    if (action && state.frame >= fighter.cancelWindowEndFrame) {
      if (action.type === 'reverse' && state.frame <= fighter.reversalWindowEndFrame) {
        fighter.momentum += 10;
        opponent.currentMove = undefined;
      }
      if (action.type === 'grapple') {
        const selected = this.pickMove(this.getContext(id, opponentId), fighter.spirit > 50);
        fighter.currentMove = selected.id;
        fighter.stamina = Math.max(0, fighter.stamina - selected.staminaCost);
        fighter.spirit = Math.min(100, fighter.spirit + selected.spiritGain);
        opponent.health -= selected.damage;
        opponent.limb[selected.limbTarget] = Math.max(0, opponent.limb[selected.limbTarget] - selected.damage * 1.5);
        fighter.cancelWindowEndFrame = state.frame + selected.recovery;
        opponent.reversalWindowEndFrame = state.frame + selected.active;
      }
      if (action.type === 'lightStrike' || action.type === 'heavyStrike') {
        const scale = action.type === 'heavyStrike' ? 1.5 : 1;
        opponent.health -= 4 * scale;
        fighter.momentum += 2 * scale;
      }
      if (action.type === 'run') {
        fighter.momentum += 1;
      }
    }

    fighter.stamina = Math.min(100, fighter.stamina + 0.05);
    opponent.downFrames = opponent.health < 20 ? opponent.downFrames + 1 : 0;

    return {
      ...state,
      fighters: {
        ...state.fighters,
        [id]: fighter,
        [opponentId]: opponent,
      },
    };
  }

  private resolveAIOpponent(state: MatchState): MatchState {
    const ai = state.fighters.p2;
    const p1 = state.fighters.p1;
    const decision = chooseAIDecision(ai, p1, state, this.getContext('p2', 'p1'), 3, this.rng());

    if (decision.action === 'grapple' && decision.move) {
      ai.currentMove = decision.move.id;
      ai.spirit = Math.min(100, ai.spirit + decision.move.spiritGain);
      ai.stamina = Math.max(0, ai.stamina - decision.move.staminaCost);
      p1.health -= decision.move.damage;
      p1.reversalWindowEndFrame = state.frame + decision.move.active;
    } else if (decision.action === 'strike') {
      p1.health -= 3;
    } else if (decision.action === 'pin' && p1.grounded) {
      return { ...state, phase: 'pinfall' };
    }

    return {
      ...state,
      fighters: {
        ...state.fighters,
        p1,
        p2: ai,
      },
    };
  }

  private resolveRingMovement(state: MatchState): MatchState {
    const pos1 = this.world.transforms.get('p1');
    const pos2 = this.world.transforms.get('p2');
    if (!pos1 || !pos2) return state;

    const boundedP1 = clampToRing(pos1.x + 0.02, pos1.z, { halfWidth: 4, halfDepth: 4, ropeHeight: 1.1 });
    const boundedP2 = clampToRing(pos2.x - 0.02, pos2.z, { halfWidth: 4, halfDepth: 4, ropeHeight: 1.1 });
    this.world.transforms.set('p1', { ...pos1, x: boundedP1.x, z: boundedP1.z });
    this.world.transforms.set('p2', { ...pos2, x: boundedP2.x, z: boundedP2.z });

    const fighters = { ...state.fighters };
    if (boundedP1.ropeContact) fighters.p1.ropeBreakAvailable = true;
    if (boundedP2.ropeContact) fighters.p2.ropeBreakAvailable = true;

    return { ...state, fighters };
  }

  private createInitialState(): MatchState {
    const fighter = (id: FighterId, name: string): FighterState => ({
      id,
      name,
      health: 100,
      spirit: 0,
      stamina: 100,
      momentum: 0,
      grounded: false,
      limb: { head: 100, torso: 100, leftArm: 100, rightArm: 100, leftLeg: 100, rightLeg: 100 },
      cancelWindowEndFrame: 0,
      reversalWindowEndFrame: 0,
      ropeBreakAvailable: false,
      downFrames: 0,
      aiProfile: id === 'p2' ? 'balanced' : 'human',
    });

    return {
      frame: 0,
      phase: 'intro',
      fighters: {
        p1: fighter('p1', 'Player One'),
        p2: fighter('p2', 'Rival CPU'),
      },
      refereeCount: 0,
      outsideRingFrames: { p1: 0, p2: 0 },
      outcome: { type: 'none' },
    };
  }

  private getContext(id: FighterId, opponentId: FighterId): PositionContext {
    const self = this.world.transforms.get(id);
    const other = this.world.transforms.get(opponentId);
    if (!self || !other) return 'front';

    const dx = other.x - self.x;
    const dz = other.z - self.z;
    const absDx = Math.abs(dx);
    const absDz = Math.abs(dz);

    if (Math.max(absDx, absDz) < 0.8) return 'ground';
    if (Math.abs(other.x) > 3.8 || Math.abs(other.z) > 3.8) return 'corner';
    if (absDx > absDz) return dx > 0 ? 'side' : 'back';
    return 'front';
  }

  private pickMove(context: PositionContext, heavy: boolean) {
    const options = moveset.filter((move) => move.context.includes(context));
    if (!options.length) return moveset[0];
    const filtered = heavy ? options.filter((move) => move.tier !== 'light') : options;
    return filtered[0] ?? options[0];
  }
}
