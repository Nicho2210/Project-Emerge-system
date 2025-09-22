import * as THREE from 'three';
import { useRef } from 'react';
import type { ObstacleData } from '../types/ObstacleData';

const greenMaterial = new THREE.MeshStandardMaterial({ color: 'green' });

interface ObstacleProps {
  obstacle: ObstacleData;
}

function Obstacle({ obstacle }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position, size } = obstacle;

  return (
    <mesh
          receiveShadow
          position={[position.x, size / 2, position.y]}
          ref={meshRef}
          material={greenMaterial}
        >
            <boxGeometry args={[size, size, size]} />
        </mesh>
  );
}

export default Obstacle;