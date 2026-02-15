import type { FighterId, InputFrame } from '../core/types';

export interface BufferedAction {
  type: 'lightStrike' | 'heavyStrike' | 'grapple' | 'run' | 'block' | 'reverse';
  frame: number;
}

export class InputBuffer {
  private readonly frames = new Map<FighterId, InputFrame[]>();
  private readonly bufferWindow = 12;

  push(id: FighterId, frame: InputFrame): void {
    const current = this.frames.get(id) ?? [];
    current.push(frame);
    if (current.length > 60) current.shift();
    this.frames.set(id, current);
  }

  consumeBufferedAction(id: FighterId, nowFrame: number): BufferedAction | undefined {
    const recent = this.frames.get(id)?.slice(-this.bufferWindow) ?? [];
    const buttonOrder: BufferedAction['type'][] = [
      'reverse',
      'grapple',
      'heavyStrike',
      'lightStrike',
      'run',
      'block',
    ];

    for (const type of buttonOrder) {
      const found = recent.findLast((frame) => frame[type]);
      if (found && nowFrame - found.frame <= this.bufferWindow) {
        return { type, frame: found.frame };
      }
    }

    return undefined;
  }
}
