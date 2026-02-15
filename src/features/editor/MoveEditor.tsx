import { useMemo, useState } from 'react';
import { moveset } from '../../engine/data/moveset';

export function MoveEditor(): JSX.Element {
  const [filter, setFilter] = useState('');
  const filtered = useMemo(
    () => moveset.filter((move) => move.name.toLowerCase().includes(filter.toLowerCase())),
    [filter],
  );

  return (
    <aside className="editor">
      <h3>Move/Character Editor (Data-driven JSON)</h3>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter moves" />
      <ul>
        {filtered.map((move) => (
          <li key={move.id}>
            <strong>{move.name}</strong> [{move.context.join('/')}] dmg:{move.damage} cost:{move.staminaCost}
          </li>
        ))}
      </ul>
    </aside>
  );
}
