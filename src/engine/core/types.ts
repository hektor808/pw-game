export type FighterId = 'p1' | 'p2' | `ai-${number}`;

export type PositionContext = 'front' | 'side' | 'back' | 'corner' | 'ground';

export type GrappleTier = 'light' | 'medium' | 'heavy';

export type MatchPhase =
  | 'intro'
  | 'bell'
  | 'active'
  | 'pinfall'
  | 'submission'
  | 'finish'
  | 'result';

export type RuleOutcome =
  | { type: 'none' }
  | { type: 'dq'; loser: FighterId; reason: string }
  | { type: 'countout'; loser: FighterId }
  | { type: 'ko'; loser: FighterId }
  | { type: 'pin'; loser: FighterId }
  | { type: 'submission'; loser: FighterId };

export interface LimbHealth {
  head: number;
  torso: number;
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
}

export interface InputFrame {
  frame: number;
  direction: { x: number; y: number };
  lightStrike: boolean;
  heavyStrike: boolean;
  grapple: boolean;
  run: boolean;
  block: boolean;
  reverse: boolean;
}

export interface MoveData {
  id: string;
  name: string;
  context: PositionContext[];
  tier: GrappleTier;
  startup: number;
  active: number;
  recovery: number;
  staminaCost: number;
  spiritGain: number;
  damage: number;
  limbTarget: keyof LimbHealth;
  canPin?: boolean;
  canSubmit?: boolean;
}

export interface FighterState {
  id: FighterId;
  name: string;
  health: number;
  spirit: number;
  stamina: number;
  limb: LimbHealth;
  momentum: number;
  grounded: boolean;
  currentMove?: string;
  cancelWindowEndFrame: number;
  reversalWindowEndFrame: number;
  ropeBreakAvailable: boolean;
  downFrames: number;
  aiProfile: string;
}

export interface MatchState {
  frame: number;
  phase: MatchPhase;
  fighters: Record<FighterId, FighterState>;
  refereeCount: number;
  outsideRingFrames: Record<FighterId, number>;
  winner?: FighterId;
  outcome: RuleOutcome;
}

export interface EngineConfig {
  fixedDeltaMs: number;
  maxCatchUpSteps: number;
  ropeBreakDistance: number;
}
