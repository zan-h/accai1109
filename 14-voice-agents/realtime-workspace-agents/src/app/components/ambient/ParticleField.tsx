// ParticleField.tsx - WebGL particle background component
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleFieldProps {
  particleCount?: number;
  mouseInfluence?: number;
  driftSpeed?: number;
}

export default function ParticleField({
  particleCount = 2000,
  mouseInfluence = 0.05,
  driftSpeed = 0.1,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Check if reduced motion is preferred
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;
    if (prefersReducedMotion) return;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true,
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;
    
    // Particle geometry
    const geometry = new THREE.BufferGeometry();
    const count = window.innerWidth < 768 ? 500 : particleCount; // Reduce count on mobile
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    const cyanColor = new THREE.Color(0x00d9ff);
    const magentaColor = new THREE.Color(0xff00e5);
    
    for (let i = 0; i < count * 3; i += 3) {
      // Random positions in 3D space
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      
      // Velocity for drift animation
      velocities[i] = (Math.random() - 0.5) * 0.01;
      velocities[i + 1] = Math.random() * driftSpeed * 0.01;
      velocities[i + 2] = (Math.random() - 0.5) * 0.01;
      
      // Random color between cyan and magenta
      const mixColor = new THREE.Color().lerpColors(
        cyanColor, 
        magentaColor, 
        Math.random()
      );
      colors[i] = mixColor.r;
      colors[i + 1] = mixColor.g;
      colors[i + 2] = mixColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    // Particle material with custom shader
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const positionArray = particles.geometry.attributes.position.array as Float32Array;
      const velocityArray = particles.geometry.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < count * 3; i += 3) {
        // Apply velocity
        positionArray[i] += velocityArray[i];
        positionArray[i + 1] += velocityArray[i + 1];
        positionArray[i + 2] += velocityArray[i + 2];
        
        // Mouse influence (subtle parallax)
        const mouseInfluenceX = mousePos.current.x * mouseInfluence * (positionArray[i + 2] + 5) / 10;
        const mouseInfluenceY = mousePos.current.y * mouseInfluence * (positionArray[i + 2] + 5) / 10;
        positionArray[i] += mouseInfluenceX * 0.01;
        positionArray[i + 1] += mouseInfluenceY * 0.01;
        
        // Wrap around boundaries
        if (positionArray[i + 1] > 10) positionArray[i + 1] = -10;
        if (positionArray[i] > 10) positionArray[i] = -10;
        if (positionArray[i] < -10) positionArray[i] = 10;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0002;
      
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
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
    };
  }, [particleCount, mouseInfluence, driftSpeed]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}

