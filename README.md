# PW Game — AKI Reforged (Web Prototype)

A modern TypeScript + React + Three.js wrestling game prototype focused on classic AKI-era pacing and systems: grapple tiers, timing reversals, momentum, stamina + limb damage, ring awareness, and deterministic simulation.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Rendering**: Three.js (WebGL2, WebGPU-ready architecture)
- **Simulation**: deterministic fixed timestep (60 Hz)
- **Physics**: Rapier integration scaffold (`@dimforge/rapier3d-compat`)
- **State**: finite state machine + ECS-lite world + data-driven move definitions
- **Testing**: Vitest

## Quick Start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Controls

- `J`: light strike
- `K`: heavy strike
- `L`: grapple
- `Space`: reversal input

## Implemented Core Systems

- Fixed-step deterministic simulation loop (`src/engine/simulation/fixedLoop.ts`)
- Match phase finite-state machine (`intro > bell > active > pinfall/submission > finish > result`)
- Buffered input + cancel/reversal window checks
- Contextual move selection (front/side/back/corner/ground)
- Grapple, strike, rope contact + rope-break availability
- Rule evaluation: KO + count-out baseline, finish routing
- CPU tactics model (momentum/spirit/health-aware)
- Rollback snapshot store + spectator-ready state persistence stubs
- Camera director for framing both wrestlers
- HUD, match flow panel, move editor UI
- Data-driven mod-friendly JSON movesets (`src/engine/data/moves.json`)

## Production Pipeline Notes

See `docs/ARCHITECTURE.md` for:
- animation event pipeline (GLTF + event tracks)
- referee logic roadmap
- pin/submission struggle model
- netcode protocol notes
- telemetry/replay/frame-step debugging strategy
- performance budget for stable 60 fps

## Project Layout

```text
src/
  app/              # React shell + store + engine boot
  engine/
    core/           # Match state + game engine
    ecs/            # Lightweight entity/component storage
    input/          # Input buffering
    simulation/     # Fixed timestep driver
    match/          # Rule logic + phase machine
    ai/             # CPU behavior and difficulty hooks
    physics/        # Ring bounds + Rapier world setup
    netcode/        # Rollback snapshot scaffolding
    animation/      # Animation graph + events
    camera/         # Dynamic camera framing
    debug/          # Telemetry buffer
    data/           # Moves/profile data
  features/
    hud/ editor/ menus/
```

## Modding

Moves are JSON documents, designed for workshop/mod ingestion:
- startup/active/recovery frame timings
- stamina/spirit economy
- context gates and limb target metadata

A full character + moveset editor can serialize directly to this format.
