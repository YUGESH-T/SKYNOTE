
import * as THREE from 'three';

export default class Stars {
  private scene: THREE.Scene;
  private particles: THREE.Points;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    const starCount = 5000;
    const positions = [];
    for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        const d = Math.sqrt(x*x+y*y+z*z);
        if (d < 500) continue; // skip stars too close to center
        positions.push(x, y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(delta: number) {
    this.particles.rotation.y += delta * 0.01;
  }

  remove() {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
  }
}

    