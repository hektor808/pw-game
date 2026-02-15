import type { MatchState } from '../core/types';

export interface RollbackFrame {
  frame: number;
  hash: string;
  state: MatchState;
}

function hashState(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export class RollbackStore {
  private frames = new Map<number, RollbackFrame>();

  save(frame: number, state: MatchState): void {
    const serialized = JSON.stringify(state);
    this.frames.set(frame, {
      frame,
      hash: hashState(serialized),
      state: structuredClone(state),
    });
    if (this.frames.size > 300) {
      const first = Math.min(...this.frames.keys());
      this.frames.delete(first);
    }
  }

  load(frame: number): RollbackFrame | undefined {
    return this.frames.get(frame);
  }
}
