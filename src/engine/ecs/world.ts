import type { FighterId } from '../core/types';

export interface Entity {
  id: FighterId;
  tags: Set<string>;
}

export interface ComponentStore<T> {
  get(id: FighterId): T | undefined;
  set(id: FighterId, value: T): void;
  entries(): [FighterId, T][];
}

class MapStore<T> implements ComponentStore<T> {
  constructor(private readonly store = new Map<FighterId, T>()) {}

  get(id: FighterId): T | undefined {
    return this.store.get(id);
  }

  set(id: FighterId, value: T): void {
    this.store.set(id, value);
  }

  entries(): [FighterId, T][] {
    return [...this.store.entries()];
  }
}

export class World {
  readonly entities = new Map<FighterId, Entity>();
  readonly transforms = new MapStore<{ x: number; y: number; z: number; yaw: number }>();
  readonly velocity = new MapStore<{ x: number; y: number; z: number }>();

  spawn(id: FighterId, tags: string[] = []): Entity {
    const entity: Entity = { id, tags: new Set(tags) };
    this.entities.set(id, entity);
    return entity;
  }
}
