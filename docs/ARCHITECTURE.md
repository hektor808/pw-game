# Architecture Blueprint

## 1. Simulation and Determinism

- 60 Hz fixed timestep simulation for lockstep/rollback compatibility.
- ECS-lite world holds transform/velocity and can be replaced with fuller archetype ECS.
- No simulation decisions rely on wall-clock time.
- RNG uses a seeded LCG and can be synchronized over netcode.

## 2. AKI-era Core Game Feel Upgrades

- **Priority/tier grapples**: light/medium/heavy tiers with stamina + spirit economy.
- **Timing reversals**: reversal windows are set per move active frame span.
- **Momentum/Spirit meter**: scales AI aggression and finisher access.
- **Limb damage**: move metadata targets limbs, enabling contextual penalties.
- **Pacing**: startup/active/recovery drives frame advantage and rhythm.

## 3. Combat and Context Engine

- Position context resolver supports `front/side/back/corner/ground`.
- Contextual move lookup from JSON move bank.
- Strike chains + grapple entry + Irish whip/corner flow extension points are explicit in `GameEngine.step()`.
- Rope detection sets rope-break eligibility.

## 4. Match Rules and Referee

Current:
- KO + count-out enforcement
- finish routing and result output

Roadmap:
- DQ infractions (illegal weapons, rope choke beyond count)
- referee line-of-sight and obstruction simulation
- pin counts with shoulder state and break logic
- submission rope break interrupts

## 5. Animation + Assets

- GLTF clips should include semantic event tracks (`hitbox_on`, `reversal_window_open`, `pin_count_start`).
- `AnimationGraph` maps gameplay state to clips and supports blend transitions.
- Recommended pipeline:
  1. Author in Blender/Maya, export GLTF.
  2. Generate animation event sidecar JSON.
  3. Validate events against move frame data.

## 6. Physics and Ring

- Rapier world setup includes ring floor collider.
- Procedural ropes/cables can be represented as spring constraints + collision capsules.
- Ring boundary clamp currently provides deterministic baseline behavior.

## 7. AI

- Decision scoring considers momentum, spirit, opponent health/stamina, and context.
- Difficulty curve parameters:
  - reversal readiness
  - combo extension probability
  - risk tolerance for heavy grapples

## 8. Netcode + Spectator

- Rollback snapshot store keeps a rolling deterministic state window.
- Extend with:
  - input delay + prediction
  - state hash verification
  - timeline correction / re-sim
- Spectator mode can consume authoritative frame stream and render without local inputs.

## 9. UI/UX

- HUD: health/spirit/stamina, phase, FPS.
- Match flow panel: camera mode, rule status.
- Move editor: JSON-backed move data browser (expand to full CRUD).
- Planned additions: pause replay scrubber, move list trainer, combo trials.

## 10. Performance Targets (60 FPS)

- Simulation budget: < 3 ms/frame.
- Render budget: < 10 ms/frame at 1080p.
- Keep draw calls low with instancing for crowds and pooled VFX.
- Instrument telemetry in release and dev overlays.

## 11. Testing/Debug Tooling

- Unit tests for rules and deterministic systems.
- Replay/frame-step harness via saved inputs and snapshot validation.
- Telemetry ring buffer for frame timings and rollback events.

## 12. Deployment

- Vite static build deployable to Netlify, Vercel, Cloudflare Pages.
- Optional dedicated authoritative relay server for rollback matchmaking.
