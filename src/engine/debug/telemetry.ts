export interface TelemetryFrame {
  frame: number;
  simMs: number;
  renderMs: number;
  rollbackEvents: number;
}

export class TelemetryBuffer {
  private readonly samples: TelemetryFrame[] = [];

  push(sample: TelemetryFrame): void {
    this.samples.push(sample);
    if (this.samples.length > 1200) this.samples.shift();
  }

  avgSimTime(): number {
    if (!this.samples.length) return 0;
    return this.samples.reduce((sum, sample) => sum + sample.simMs, 0) / this.samples.length;
  }
}
