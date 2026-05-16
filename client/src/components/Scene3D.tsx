import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type Scene3DProps = {
  className?: string;
};

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export function Scene3D({ className = "" }: Scene3DProps) {
  const [reduced, setReduced] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduced || !supported) return null;

  return (
    <div
      className={`scene-3d-root ${className}`.trim()}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

function SceneContent() {
  const groupRef = useRef<THREE.Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    g.rotation.x += (mouseRef.current.y * 0.04 - g.rotation.x) * 0.015;
    g.rotation.y += (mouseRef.current.x * 0.04 - g.rotation.y) * 0.015;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c4b5fd" />
      <pointLight position={[0, -10, 10]} intensity={0.3} color="#7dd3fc" />

      <FloatingShape
        position={[-2.5, 1.5, -3]}
        color="#c4b5fd"
        geometryKey="icosahedron"
        scale={0.9}
      />
      <FloatingShape
        position={[2.8, -1.2, -4]}
        color="#7dd3fc"
        geometryKey="torusKnot"
        scale={0.7}
      />
      <FloatingShape
        position={[0, 2.8, -5]}
        color="#f9a8d4"
        geometryKey="octahedron"
        scale={0.8}
      />
      <FloatingShape
        position={[-3.2, -2, -6]}
        color="#fbbf24"
        geometryKey="dodecahedron"
        scale={0.55}
      />

      <ParticleField count={250} />
    </group>
  );
}

const GEOMETRY_CACHE = new Map<string, THREE.BufferGeometry>();

function getGeometry(key: string): THREE.BufferGeometry {
  const cached = GEOMETRY_CACHE.get(key);
  if (cached) return cached;
  let geo: THREE.BufferGeometry;
  switch (key) {
    case "icosahedron":
      geo = new THREE.IcosahedronGeometry(1, 0);
      break;
    case "torusKnot":
      geo = new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8);
      break;
    case "octahedron":
      geo = new THREE.OctahedronGeometry(1);
      break;
    case "dodecahedron":
      geo = new THREE.DodecahedronGeometry(1);
      break;
    default:
      geo = new THREE.IcosahedronGeometry(1, 0);
  }
  GEOMETRY_CACHE.set(key, geo);
  return geo;
}

type FloatingShapeProps = {
  position: [number, number, number];
  color: string;
  geometryKey: string;
  scale: number;
};

function FloatingShape({
  position,
  color,
  geometryKey,
  scale,
}: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = getGeometry(geometryKey);

  useFrame((_st, dt) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += dt * 0.2;
    meshRef.current.rotation.y += dt * 0.3;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={position}
        scale={scale}
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.3}
          roughness={0.15}
          transparent
          opacity={0.55}
          envMapIntensity={0.8}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>
    </Float>
  );
}

type ParticleFieldProps = {
  count: number;
};

function ParticleField({ count }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      siz[i] = 0.02 + Math.random() * 0.04;
    }
    return [pos, siz];
  }, [count]);

  useFrame((_st, dt) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += dt * 0.008;
    pointsRef.current.rotation.x += dt * 0.004;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#c4b5fd"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
