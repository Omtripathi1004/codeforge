'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 2600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 36;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 36;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.012;
    ref.current.rotation.x = Math.sin(t * 0.006) * 0.03;
    // Interactive mouse parallax with smooth lerp
    ref.current.position.x += (state.pointer.x * 0.6 - ref.current.position.x) * 0.03;
    ref.current.position.y += (state.pointer.y * 0.4 - ref.current.position.y) * 0.03;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4aaeff"
        size={0.014}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

function GlitterParticles() {
  const count = 220;
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
      const r = 1.0 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - 0.5;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 1.2;
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
    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.z = Math.sin(t * 0.03) * 0.08;
    ref.current.position.x += (state.pointer.x * 0.4 - ref.current.position.x) * 0.04;
    ref.current.position.y += (state.pointer.y * 0.3 - ref.current.position.y) * 0.04;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.038}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

function InteractiveTotemOrbs({ showSpine = false }: { showSpine?: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.14 + state.pointer.x * 0.25;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.05 + state.pointer.y * 0.15;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.08 - 0.2;
  });

  const rings = useMemo(() => {
    const ringCount = showSpine ? 9 : 5;
    return Array.from({ length: ringCount }).map((_, i) => ({
      y: (i - (ringCount - 1) / 2) * (showSpine ? 0.52 : 0.65),
      scale: 0.5 + Math.sin((i / (ringCount - 1)) * Math.PI) * (showSpine ? 0.35 : 0.45),
      rotOffset: i * 0.45,
      color: ['#00f3ff', '#cf3fff', '#00ff99', '#ffaa00', '#4aaeff'][i % 5],
    }));
  }, [showSpine]);

  return (
    <group ref={groupRef} position={[0, -0.2, showSpine ? -2.4 : -3.5]}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, r.y, 0]} rotation={[0.2 * Math.sin(i), r.rotOffset, 0.1 * Math.cos(i)]}>
          <torusGeometry args={[r.scale, 0.1, 16, 36]} />
          <meshStandardMaterial
            color={r.color}
            roughness={0.12}
            metalness={0.88}
            transparent
            opacity={showSpine ? 0.65 : 0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneLighting() {
  const pointerLight = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    if (pointerLight.current) {
      pointerLight.current.position.x = state.pointer.x * 5;
      pointerLight.current.position.y = state.pointer.y * 3.5;
    }
    // Interactive camera motion parallax
    state.camera.position.x += (state.pointer.x * 0.4 - state.camera.position.x) * 0.02;
    state.camera.position.y += (-state.pointer.y * 0.25 - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.28} />
      <pointLight ref={pointerLight} position={[0, 0, 2]} color="#00f3ff" intensity={2.2} distance={8} />
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
        <StarField count={2600} />
        <GlitterParticles />
        <InteractiveTotemOrbs showSpine={showSpine} />
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
