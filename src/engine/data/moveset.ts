import rawMoves from './moves.json';
import type { MoveData, PositionContext } from '../core/types';

export const moveset = rawMoves as MoveData[];

export function findMoveByContext(context: PositionContext, preferHeavy: boolean): MoveData {
  const candidates = moveset.filter((move) => move.context.includes(context));
  if (preferHeavy) {
    return candidates.find((move) => move.tier === 'heavy') ?? candidates[0];
  }
  return candidates.find((move) => move.tier === 'light') ?? candidates[0];
}
