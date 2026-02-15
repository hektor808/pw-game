import type { FighterState, MatchState, MoveData, PositionContext } from '../core/types';
import { findMoveByContext } from '../data/moveset';

export interface AIDecision {
  action: 'approach' | 'strike' | 'grapple' | 'irishWhip' | 'pin' | 'submit' | 'taunt';
  move?: MoveData;
}

export function chooseAIDecision(
  self: FighterState,
  opponent: FighterState,
  state: MatchState,
  context: PositionContext,
  difficulty: number,
  roll: number,
): AIDecision {
  const aggression = Math.min(1, 0.3 + difficulty * 0.12 + self.momentum * 0.01);
  const finishBias = opponent.health < 25 || opponent.stamina < 20;

  if (state.phase === 'active' && finishBias && context === 'ground') {
    if (self.spirit > 50) return { action: 'submit', move: findMoveByContext('ground', true) };
    return { action: 'pin', move: findMoveByContext('ground', false) };
  }

  if (roll < aggression) {
    return { action: 'grapple', move: findMoveByContext(context, self.spirit > 60) };
  }

  if (opponent.grounded && roll > 0.4) {
    return { action: 'pin', move: findMoveByContext('ground', false) };
  }

  return { action: 'strike' };
}
