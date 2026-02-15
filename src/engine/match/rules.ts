import type { FighterId, MatchState, RuleOutcome } from '../core/types';

export function evaluateRules(state: MatchState): RuleOutcome {
  for (const [id, fighter] of Object.entries(state.fighters) as [FighterId, MatchState['fighters'][FighterId]][]) {
    if (fighter.health <= 0 || fighter.downFrames > 600) {
      return { type: 'ko', loser: id };
    }

    if (state.outsideRingFrames[id] > 600) {
      return { type: 'countout', loser: id };
    }
  }

  return { type: 'none' };
}

export function applyOutcome(state: MatchState, outcome: RuleOutcome): MatchState {
  if (outcome.type === 'none') return state;

  const loser = outcome.loser;
  const winner = (Object.keys(state.fighters) as FighterId[]).find((id) => id !== loser);
  return {
    ...state,
    phase: 'finish',
    winner,
    outcome,
  };
}
