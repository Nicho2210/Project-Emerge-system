import * as THREE from 'three';
import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import type { ObstacleData } from '../types/ObstacleData';

const greenMaterial = new THREE.MeshStandardMaterial({ color: 'green' });

interface ObstacleProps {
  obstacle: ObstacleData;
}

function Obstacle({ obstacle }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position } = obstacle;
  const { nodes } = useGLTF('/src/assets/robot-90.gltf') as any; 

  return (
    <group 
      receiveShadow
      position={[position.x, 0.017, position.y]} 
      ref={meshRef}
      scale={[0.001, 0.001, 0.001]} 
    >
      <mesh
        geometry={nodes.robot_1.geometry}
        material={greenMaterial}
      />
      <mesh
        geometry={nodes.robot_2.geometry}
        material={greenMaterial}
      />
      <mesh
        geometry={nodes.robot.geometry}
        material={greenMaterial}
      />
    </group>
  );
}

export default Obstacle;