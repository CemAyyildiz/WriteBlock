'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MousePosition {
  x: number;
  y: number;
}

function FollowerShape({ mousePos }: { mousePos: React.MutableRefObject<MousePosition> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Smooth follow mouse
      const targetX = (mousePos.current.x / window.innerWidth) * 2 - 1;
      const targetY = -(mousePos.current.y / window.innerHeight) * 2 + 1;
      
      meshRef.current.position.x += (targetX * 5 - meshRef.current.position.x) * 0.1;
      meshRef.current.position.y += (targetY * 5 - meshRef.current.position.y) * 0.1;
      
      // Rotate based on movement
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.03;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial 
        color="#FFFF00" 
        emissive="#FFFF00"
        emissiveIntensity={0.5}
        wireframe={true}
      />
    </mesh>
  );
}

export default function InteractiveCursor() {
  const mousePos = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ mixBlendMode: 'difference' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ 
          antialias: false,
          alpha: true 
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FollowerShape mousePos={mousePos} />
      </Canvas>
    </div>
  );
}

