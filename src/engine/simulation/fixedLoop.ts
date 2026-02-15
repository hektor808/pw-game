import type { EngineConfig } from '../core/types';

export type FixedStepCallback = (deltaMs: number) => void;

export class FixedTimestepRunner {
  private accumulator = 0;
  private lastTime = performance.now();
  private running = false;

  constructor(
    private readonly config: EngineConfig,
    private readonly onFixedStep: FixedStepCallback,
    private readonly onRender: (alpha: number) => void,
  ) {}

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
  }

  private tick = (now: number): void => {
    if (!this.running) return;

    const frameTime = now - this.lastTime;
    this.lastTime = now;
    this.accumulator += Math.min(frameTime, this.config.fixedDeltaMs * this.config.maxCatchUpSteps);

    let steps = 0;
    while (this.accumulator >= this.config.fixedDeltaMs && steps < this.config.maxCatchUpSteps) {
      this.onFixedStep(this.config.fixedDeltaMs);
      this.accumulator -= this.config.fixedDeltaMs;
      steps += 1;
    }

    const alpha = this.accumulator / this.config.fixedDeltaMs;
    this.onRender(alpha);
    requestAnimationFrame(this.tick);
  };
}
