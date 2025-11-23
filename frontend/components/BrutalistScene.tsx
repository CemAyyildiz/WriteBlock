'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Rotating geometric shapes
function RotatingCube({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.5;
      meshRef.current.rotation.y += delta * speed * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={false}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Wireframe sphere
function WireframeSphere({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.2;
      meshRef.current.rotation.y += delta * speed * 0.4;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={true}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Octahedron
function FloatingOctahedron({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.6;
      meshRef.current.rotation.z += delta * speed * 0.4;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + 1) * 0.8;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[1.2]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={false}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Torus
function RotatingTorus({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.5;
      meshRef.current.rotation.y += delta * speed * 0.5;
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1, 0.4, 16, 32]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={true}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

// Main Scene
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFFF00" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF00FF" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#00FF00" />

      {/* Geometric Shapes - Brutalist Colors */}
      <RotatingCube position={[-3, 2, 0]} color="#FFFF00" speed={0.8} />
      <RotatingCube position={[3, -1, 2]} color="#FF0000" speed={1.2} />
      
      <WireframeSphere position={[0, 0, -2]} color="#00FF00" speed={0.6} />
      <WireframeSphere position={[-4, -2, 1]} color="#0000FF" speed={1.0} />
      
      <FloatingOctahedron position={[2, 1, -1]} color="#FF00FF" speed={0.9} />
      <FloatingOctahedron position={[-2, -1, 2]} color="#FFFF00" speed={1.1} />
      
      <RotatingTorus position={[0, 2, 1]} color="#FF00FF" speed={0.7} />
      <RotatingTorus position={[4, 1, -2]} color="#00FFFF" speed={1.3} />

    </>
  );
}

export default function BrutalistScene() {
  return (
    <div className="fixed inset-0 -z-10 opacity-20">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ 
          antialias: false, // Brutalist = no smoothing
          alpha: true 
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

