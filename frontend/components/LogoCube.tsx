'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.8;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#000000" 
        wireframe={true}
        emissive="#FFFF00"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export default function LogoCube() {
  return (
    <div className="w-10 h-10 inline-block align-middle mr-2">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ 
          antialias: false,
          alpha: true 
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#FFFF00" />
        <RotatingCube />
      </Canvas>
    </div>
  );
}

