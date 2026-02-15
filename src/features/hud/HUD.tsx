import { useGameStore } from '../../app/useGameStore';

export function HUD(): JSX.Element {
  const state = useGameStore((s) => s.state);
  const fps = useGameStore((s) => s.fps);
  if (!state) return <div className="hud">Booting simulation...</div>;

  const p1 = state.fighters.p1;
  const p2 = state.fighters.p2;

  return (
    <div className="hud">
      <div className="fighter-panel">
        <h2>{p1.name}</h2>
        <p>HP {p1.health.toFixed(0)} | Spirit {p1.spirit.toFixed(0)} | Stamina {p1.stamina.toFixed(0)}</p>
      </div>
      <div className="center-panel">
        <p>Phase: {state.phase}</p>
        <p>Frame: {state.frame}</p>
        <p>FPS: {fps.toFixed(1)}</p>
      </div>
      <div className="fighter-panel right">
        <h2>{p2.name}</h2>
        <p>HP {p2.health.toFixed(0)} | Spirit {p2.spirit.toFixed(0)} | Stamina {p2.stamina.toFixed(0)}</p>
      </div>
    </div>
  );
}
