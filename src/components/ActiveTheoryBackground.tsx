'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 2200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 32;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 32;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.01;
    ref.current.rotation.x = Math.sin(t * 0.005) * 0.025;
    // Mouse parallax
    ref.current.position.x += (state.mouse.x * 0.3 - ref.current.position.x) * 0.02;
    ref.current.position.y += (state.mouse.y * 0.2 - ref.current.position.y) * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4aaeff"
        size={0.013}
        sizeAttenuation
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}

function GlitterParticles() {
  const count = 160;
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0, 0.95, 1],    // cyan
      [0.81, 0.25, 1],  // violet
      [1, 0.67, 0],     // amber
      [0, 1, 0.6],      // emerald
      [0.31, 0.62, 1],  // azure
      [1, 0.27, 0.45],  // rose
    ];
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - 0.8;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 1.5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.03) * 0.06;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

function ActiveTheoryTotemSpine() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.08 - 0.2;
  });

  const rings = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => ({
      y: (i - 4) * 0.52,
      scale: 0.5 + Math.sin((i / 8) * Math.PI) * 0.35,
      rotOffset: i * 0.45,
      color: ['#00f3ff', '#cf3fff', '#00ff99', '#ffaa00', '#4aaeff'][i % 5],
    }));
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.2, -2.4]}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, r.y, 0]} rotation={[0.2 * Math.sin(i), r.rotOffset, 0.1 * Math.cos(i)]}>
          <torusGeometry args={[r.scale, 0.11, 16, 36]} />
          <meshStandardMaterial
            color={r.color}
            roughness={0.12}
            metalness={0.88}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[-4, 3, 3]} color="#00f3ff" intensity={1.8} distance={14} />
      <pointLight position={[4, -2, 2]} color="#cf3fff" intensity={1.6} distance={12} />
      <pointLight position={[0, 4, 2]}  color="#4aaeff" intensity={1.0} distance={10} />
    </>
  );
}

interface ActiveTheoryBackgroundProps {
  showSpine?: boolean;
}

export const ActiveTheoryBackground: React.FC<ActiveTheoryBackgroundProps> = ({ showSpine = false }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#030408' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneLighting />
        <StarField count={2200} />
        <GlitterParticles />
        {showSpine && <ActiveTheoryTotemSpine />}
      </Canvas>

      {/* Active Theory Radial Obsidian Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(3,4,8,0.7) 75%, #030408 100%)',
        }}
      />
    </div>
  );
};
