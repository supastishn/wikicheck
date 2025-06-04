<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer;
let particles: THREE.Points;

onMounted(() => {
  // Initialize scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create particles
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 10;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
    sizes[i] = Math.random() * 0.2 - 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x4d79ff) },
      time: { value: 0 }
    },
    vertexShader: `
      uniform float time;
      attribute float size;
      varying vec3 vPosition;
      
      void main() {
        vPosition = position;
        vec3 newPosition = position;
        newPosition.x += sin(time * 0.3 + position.z) * 0.35;
        newPosition.y += cos(time * 0.2 + position.x) * 0.35;
        newPosition.z += cos(time * 0.4 + position.y) * 0.35;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        gl_PointSize = size * 200.0;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
    
      void main() {
        float distanceToCenter = distance(gl_PointCoord.xy, vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, distanceToCenter);
        gl_FragColor = vec4(color, alpha * 0.8);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Initialize renderer
  renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true 
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value!.appendChild(renderer.domElement);

  // Animation
  let animationId: number;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    
    material.uniforms.time.value += 0.01;
    particles.rotation.x += 0.001;
    particles.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
  };
  animate();

  // Handle resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);
    container.value!.removeChild(renderer.domElement);
    renderer.dispose();
  });
});
</script>

<template>
  <div ref="container" class="particle-background"></div>
</template>

<style scoped>
.particle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
