export type AnimState = 'idle' | 'walk' | 'run' | 'strike' | 'grapple' | 'hit' | 'down' | 'pin' | 'submit';

export interface AnimationEvent {
  name: string;
  frame: number;
}

export interface AnimationClipDef {
  id: string;
  state: AnimState;
  loop: boolean;
  events: AnimationEvent[];
}

export class AnimationGraph {
  private current: AnimState = 'idle';

  transition(next: AnimState): AnimState {
    const noOp = this.current === next;
    this.current = noOp ? this.current : next;
    return this.current;
  }

  getCurrent(): AnimState {
    return this.current;
  }
}

export const defaultClipEvents: AnimationClipDef[] = [
  { id: 'strike_jab', state: 'strike', loop: false, events: [{ name: 'hitbox_on', frame: 6 }, { name: 'hitbox_off', frame: 10 }] },
  { id: 'grapple_lockup', state: 'grapple', loop: false, events: [{ name: 'reversal_window_open', frame: 3 }] },
  { id: 'pin_cover', state: 'pin', loop: false, events: [{ name: 'pin_count_start', frame: 12 }] },
];
