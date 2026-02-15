export interface RingBounds {
  halfWidth: number;
  halfDepth: number;
  ropeHeight: number;
}

export interface PhysicsWorld {
  gravity: { x: number; y: number; z: number };
  bounds: RingBounds;
}

export async function createPhysicsWorld(bounds: RingBounds): Promise<PhysicsWorld> {
  return { gravity: { x: 0, y: -9.81, z: 0 }, bounds };
}

export function clampToRing(x: number, z: number, bounds: RingBounds): { x: number; z: number; ropeContact: boolean } {
  const clampedX = Math.max(-bounds.halfWidth, Math.min(bounds.halfWidth, x));
  const clampedZ = Math.max(-bounds.halfDepth, Math.min(bounds.halfDepth, z));
  const ropeContact = clampedX !== x || clampedZ !== z;
  return { x: clampedX, z: clampedZ, ropeContact };
}
