import * as THREE from 'three';

export interface CameraTargets {
  a: THREE.Vector3;
  b: THREE.Vector3;
}

export class CameraDirector {
  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  update(targets: CameraTargets): void {
    const center = new THREE.Vector3().addVectors(targets.a, targets.b).multiplyScalar(0.5);
    const distance = Math.max(6, targets.a.distanceTo(targets.b) * 1.2);
    this.camera.position.lerp(new THREE.Vector3(center.x, 6, center.z + distance), 0.08);
    this.camera.lookAt(center);
  }
}
