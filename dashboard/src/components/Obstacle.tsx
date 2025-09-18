import * as THREE from 'three';
import { useRef, /*useState*/ } from 'react';
import type { ObstacleData } from '../types/ObstacleData';


interface ObstacleProps {
  obstacle: ObstacleData;
  onClick: () => void;
}

function Obstacle({ obstacle, onClick }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position, size } = obstacle;
  return (
    <group position={[position.x, 0, position.y]} onClick={onClick}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="brown" />
      </mesh>
    </group>
  );
}

export default Obstacle;