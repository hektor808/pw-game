import { useGameStore } from '../../app/useGameStore';

export function MatchFlowPanel(): JSX.Element {
  const state = useGameStore((s) => s.state);
  const setCameraMode = useGameStore((s) => s.setCameraMode);

  return (
    <section className="match-flow">
      <h3>Match Flow</h3>
      <p>Rules: DQ / Count-Out / KO enabled, rope breaks enforced, referee AI active.</p>
      <p>Outcome: {state?.outcome.type ?? 'none'}</p>
      <div className="buttons">
        <button onClick={() => setCameraMode('broadcast')}>Broadcast Cam</button>
        <button onClick={() => setCameraMode('ringside')}>Ringside Cam</button>
      </div>
      <p>Rollback netcode and spectator feed scaffolds are wired for deterministic snapshots.</p>
    </section>
  );
}
