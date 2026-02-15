import { create } from 'zustand';
import type { MatchState } from '../engine/core/types';

interface GameStore {
  state: MatchState | null;
  fps: number;
  cameraMode: 'broadcast' | 'ringside';
  setState: (state: MatchState) => void;
  setFps: (fps: number) => void;
  setCameraMode: (mode: GameStore['cameraMode']) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: null,
  fps: 0,
  cameraMode: 'broadcast',
  setState: (state) => set({ state }),
  setFps: (fps) => set({ fps }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
}));
