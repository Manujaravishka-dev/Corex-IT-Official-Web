"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Instances, Html } from "@react-three/drei";
import * as THREE from "three";

const BRAND_COLORS = {
  primary: 0x0057b8,
  deep: 0x071a33,
  light: 0x8ab6ff,
  white: 0xffffff,
};

const GRID_SIZE = 12;
const INSTANCE_COUNT = GRID_SIZE * GRID_SIZE;

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateParticleData(count: number, seedOffset = 0) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const seed = i * 17 + seedOffset * 100;
    const radius = 3 + seededRandom(seed) * 4;
    const theta = seededRandom(seed + 1) * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom(seed + 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 0.5;
    positions[i * 3 + 2] = radius * Math.cos(phi);
    sizes[i] = seededRandom(seed + 3) * 2 + 0.5;
  }
  return { positions, sizes };
}

interface InstanceProps {
  index: number;
  gridX: number;
  gridY: number;
  baseDelay: number;
}

function InstanceItem({
  index,
  gridX,
  gridY,
  baseDelay,
}: InstanceProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 768;
  const prefersReducedMotionRef = useRef(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();

    if (prefersReducedMotionRef.current) return;

    const time = t * 0.5;
    const waveSpeed = 0.8;
    const waveAmplitude = isMobile ? 0.15 : 0.25;

    const x = (gridX - GRID_SIZE / 2) * 0.5;
    const z = (gridY - GRID_SIZE / 2) * 0.5;

    const distanceFromCenter = Math.sqrt(x * x + z * z);
    const delay = baseDelay + distanceFromCenter * 0.3;

    const wave = Math.sin(time * waveSpeed - delay) * waveAmplitude;
    const rotation = Math.sin(time * 0.3 + delay) * 0.15;

    dummy.position.set(x, wave, z);
    dummy.rotation.set(rotation * 0.5, time * 0.08 + delay, rotation * 0.3);
    dummy.scale.setScalar(0.35 + Math.sin(time * 0.7 + delay) * 0.08);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return null;
}

import { useEffect } from "react";

function InstanceGrid() {
  const instances = useMemo(() => {
    const items: InstanceProps[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        items.push({
          index: y * GRID_SIZE + x,
          gridX: x,
          gridY: y,
          baseDelay: (x + y) * 0.15,
        });
      }
    }
    return items;
  }, []);

  return (
    <Instances limit={INSTANCE_COUNT} range={INSTANCE_COUNT}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshPhysicalMaterial
        color={BRAND_COLORS.primary}
        roughness={0.2}
        metalness={0.6}
        transparent
        opacity={0.85}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transmission={0.1}
      />
      {instances.map((item) => (
        <InstanceItem
          key={item.index}
          index={item.index}
          gridX={item.gridX}
          gridY={item.gridY}
          baseDelay={item.baseDelay}
        />
      ))}
    </Instances>
  );
}

function FloatingParticles() {
  const particleRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 768;

  const particleCount = useMemo(() => (isMobile ? 150 : 300), [isMobile]);
  const { positions, sizes } = useMemo(
    () => generateParticleData(particleCount),
    [particleCount]
  );
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state) => {
    if (!particleRef.current) return;
    const t = state.clock.getElapsedTime();

    if (prefersReducedMotionRef.current) return;

    particleRef.current.rotation.y = t * 0.015;
    particleRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;

    const positionsArray = particleRef.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 1; i < positionsArray.length; i += 3) {
      positionsArray[i] += Math.sin(t * 2 + i) * 0.0003;
    }
    particleRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particleRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={BRAND_COLORS.light}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CentralGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (prefersReducedMotionRef.current) return;

    meshRef.current.rotation.y = t * 0.1;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
    meshRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.1);
  });

  return (
    <mesh ref={meshRef} position={[0, -0.3, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshPhysicalMaterial
        color={BRAND_COLORS.primary}
        roughness={0}
        metalness={0}
        transparent
        opacity={0.15}
        transmission={0.8}
        thickness={0.5}
        ior={1.33}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MouseInteraction() {
  const { mouse, camera } = useThree();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame(() => {
    if (prefersReducedMotionRef.current) return;

    targetRef.current.x = mouse.x * 0.3;
    targetRef.current.y = mouse.y * 0.3;

    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.02;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.02;

    camera.position.set(currentRef.current.x, 0.5 + currentRef.current.y, 5);
    camera.lookAt(0, -0.3, 0);
  });

  return null;
}

function ReducedMotionNotice() {
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  if (!prefersReducedMotion) return null;

  return (
    <Html
      transform
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "12px",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        Reduced motion enabled
      </div>
    </Html>
  );
}

export function MergedInstanceScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        intensity={1.2}
        position={[5, 8, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={0.3} position={[-5, 3, -5]} />
      <InstanceGrid />
      <CentralGlow />
      <FloatingParticles />
      <MouseInteraction />
      <ReducedMotionNotice />
    </>
  );
}

interface MergedInstanceAnimationProps {
  className?: string;
}

export function MergedInstanceAnimation({
  className = "",
}: MergedInstanceAnimationProps) {
  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none ${className}`}
      style={{ opacity: 0.35 }}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0.5, 5],
          fov: 45,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        shadows={false}
      >
        <MergedInstanceScene />
      </Canvas>
    </div>
  );
}