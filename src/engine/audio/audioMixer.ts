export class AudioMixer {
  private crowdLevel = 0.2;

  setCrowdIntensity(momentumDelta: number): void {
    this.crowdLevel = Math.max(0.15, Math.min(1, this.crowdLevel + momentumDelta * 0.01));
  }

  getCrowdLevel(): number {
    return this.crowdLevel;
  }
}
