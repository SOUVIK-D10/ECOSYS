import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function CoreStructure({ cpuUsage, status, isPlugged }) {
  const outerGroupRef = useRef();
  const innerMeshRef = useRef();

  // Baseline rotation + dynamic modifier based on CPU tension (0-100)
  const baseSpeed = 0.002;
  const stressMultiplier = (cpuUsage / 100) * 0.04;
  const rotationDelta = baseSpeed + stressMultiplier;

  useFrame(() => {
    if (outerGroupRef.current) {
      outerGroupRef.current.rotation.y += rotationDelta;
      outerGroupRef.current.rotation.x += rotationDelta * 0.5;
    }
    if (innerMeshRef.current) {
      // Counter-rotate the inner core slightly for parallax effect
      innerMeshRef.current.rotation.y -= rotationDelta * 1.2;
      innerMeshRef.current.rotation.z += rotationDelta * 0.3;
    }
  });

  // Map system status to raw hex codes
  let coreColor = "#00ffaa"; // Tactical Green (NOMINAL)
  if (status === "CRITICAL") coreColor = "#ff2222"; // Red
  if (status === "UNHEALTHY") coreColor = "#ffa500"; // Amber
  if (status === "UNWELL") coreColor = "#fff222";   // yellow

  // Drop opacity if running on battery reserves to simulate power conservation
  const opacityLevel = isPlugged ? 0.9 : 0.4;

  return (
    <group ref={outerGroupRef}>
      {/* Inner Core: Solid but dark, catching the light */}
      <mesh ref={innerMeshRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial 
          color={coreColor} 
          transparent 
          opacity={0.15} 
          roughness={0.8}
        />
      </mesh>

      {/* Outer Shell: Tactical wireframe */}
      <mesh>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial 
          color={coreColor} 
          wireframe={true} 
          transparent 
          opacity={opacityLevel} 
        />
      </mesh>
    </group>
  );
}

export default function Core3D({ cpuUsage, status, isPlugged }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={isPlugged ? 1 : 0.2} />
        
        <CoreStructure 
          cpuUsage={cpuUsage} 
          status={status} 
          isPlugged={isPlugged} 
        />
      </Canvas>
    </div>
  );
}