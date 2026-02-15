import type { MatchPhase, MatchState } from '../core/types';

const transitions: Record<MatchPhase, MatchPhase[]> = {
  intro: ['bell'],
  bell: ['active'],
  active: ['pinfall', 'submission', 'finish'],
  pinfall: ['active', 'finish'],
  submission: ['active', 'finish'],
  finish: ['result'],
  result: [],
};

export function canTransition(from: MatchPhase, to: MatchPhase): boolean {
  return transitions[from].includes(to);
}

export function transitionMatchPhase(state: MatchState, to: MatchPhase): MatchState {
  if (!canTransition(state.phase, to)) return state;
  return { ...state, phase: to };
}
