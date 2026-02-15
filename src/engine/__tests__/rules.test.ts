import { describe, expect, it } from 'vitest';
import { evaluateRules } from '../match/rules';
import type { MatchState } from '../core/types';

function stateFixture(): MatchState {
  return {
    frame: 10,
    phase: 'active',
    fighters: {
      p1: {
        id: 'p1',
        name: 'One',
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
        aiProfile: 'human',
      },
      p2: {
        id: 'p2',
        name: 'Two',
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
        aiProfile: 'cpu',
      },
    },
    refereeCount: 0,
    outsideRingFrames: { p1: 0, p2: 0 },
    outcome: { type: 'none' },
  };
}

describe('rules', () => {
  it('declares KO when health drops to zero', () => {
    const state = stateFixture();
    state.fighters.p2.health = 0;
    expect(evaluateRules(state)).toEqual({ type: 'ko', loser: 'p2' });
  });

  it('declares countout outside ring too long', () => {
    const state = stateFixture();
    state.outsideRingFrames.p1 = 601;
    expect(evaluateRules(state)).toEqual({ type: 'countout', loser: 'p1' });
  });
});
