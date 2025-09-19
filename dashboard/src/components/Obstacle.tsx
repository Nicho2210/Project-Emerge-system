import * as THREE from 'three';
import type { ObstacleData } from '../types/ObstacleData';
import { useRef, /*useState*/ } from 'react';
import { useGLTF } from '@react-three/drei';



interface ObstacleProps {
  obstacle: ObstacleData;
}

function Obstacle({ obstacle }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position, size } = obstacle;
  const { nodes } = useGLTF('/src/assets/base.glb') as any; 
  return (
    <group 
      receiveShadow
      position={[position.x, 0, position.y]}
      ref={meshRef}
      scale={[0.001, 0.001, 0.001]}
    >
      <mesh
        geometry={nodes.base.geometry}
        material={new THREE.MeshStandardMaterial({ color: 'brown' })}
      />
    </group>
  );
}

export default Obstacle;