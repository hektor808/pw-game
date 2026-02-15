import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameEngine } from '../engine/core/gameEngine';
import { FixedTimestepRunner } from '../engine/simulation/fixedLoop';
import { CameraDirector } from '../engine/camera/cameraDirector';
import { RollbackStore } from '../engine/netcode/rollback';
import { TelemetryBuffer } from '../engine/debug/telemetry';
import { HUD } from '../features/hud/HUD';
import { MoveEditor } from '../features/editor/MoveEditor';
import { MatchFlowPanel } from '../features/menus/MatchFlowPanel';
import { useGameStore } from './useGameStore';

export function App(): JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const setState = useGameStore((s) => s.setState);
  const setFps = useGameStore((s) => s.setFps);

  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine({ fixedDeltaMs: 1000 / 60, maxCatchUpSteps: 5, ropeBreakDistance: 1.2 });
    const rollback = new RollbackStore();
    const telemetry = new TelemetryBuffer();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#10131a');

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight('#ffffff', 2);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight('#6688aa', 0.6));

    const mat = new THREE.MeshStandardMaterial({ color: '#2a3343' });
    const ring = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 9), mat);
    ring.position.y = 0.2;
    scene.add(ring);

    const p1Mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.2), new THREE.MeshStandardMaterial({ color: '#44a7ff' }));
    const p2Mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.2), new THREE.MeshStandardMaterial({ color: '#ff8e43' }));
    p1Mesh.position.set(-1.5, 1.2, 0);
    p2Mesh.position.set(1.5, 1.2, 0);
    scene.add(p1Mesh, p2Mesh);

    const camDirector = new CameraDirector(camera);

    const handleKeys = (event: KeyboardEvent, pressed: boolean): void => {
      const frame = engine.state.frame;
      const base = {
        frame,
        direction: { x: 0, y: 0 },
        lightStrike: false,
        heavyStrike: false,
        grapple: false,
        run: false,
        block: false,
        reverse: false,
      };

      if (event.code === 'KeyJ') engine.pushInput('p1', { ...base, lightStrike: pressed });
      if (event.code === 'KeyK') engine.pushInput('p1', { ...base, heavyStrike: pressed });
      if (event.code === 'KeyL') engine.pushInput('p1', { ...base, grapple: pressed });
      if (event.code === 'Space') engine.pushInput('p1', { ...base, reverse: pressed });
    };

    const keydown = (e: KeyboardEvent): void => handleKeys(e, true);
    window.addEventListener('keydown', keydown);

    let lastFpsTime = performance.now();
    let renderedFrames = 0;
    const runner = new FixedTimestepRunner(
      { fixedDeltaMs: 1000 / 60, maxCatchUpSteps: 5, ropeBreakDistance: 1.2 },
      () => {
        const simStart = performance.now();
        const state = engine.step();
        rollback.save(state.frame, state);
        setState(state);
        telemetry.push({ frame: state.frame, simMs: performance.now() - simStart, renderMs: 0, rollbackEvents: 0 });
      },
      () => {
        const p1 = engine.world.transforms.get('p1');
        const p2 = engine.world.transforms.get('p2');
        if (p1 && p2) {
          p1Mesh.position.set(p1.x, 1.2, p1.z);
          p2Mesh.position.set(p2.x, 1.2, p2.z);
          camDirector.update({ a: p1Mesh.position, b: p2Mesh.position });
        }

        renderer.render(scene, camera);
        renderedFrames += 1;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
          setFps((renderedFrames * 1000) / (now - lastFpsTime));
          renderedFrames = 0;
          lastFpsTime = now;
        }
      },
    );

    runner.start();

    const resize = (): void => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', resize);
    return () => {
      runner.stop();
      renderer.dispose();
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keydown);
    };
  }, [setFps, setState]);

  return (
    <main className="layout">
      <div ref={mountRef} className="viewport" />
      <HUD />
      <MatchFlowPanel />
      <MoveEditor />
    </main>
  );
}
