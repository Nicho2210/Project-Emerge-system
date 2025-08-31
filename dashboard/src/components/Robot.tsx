import * as THREE from 'three';
import type { RobotData } from '../types/RobotData';
import { useRef, useState } from 'react';
import { Select } from '@react-three/postprocessing';
import { useGLTF } from '@react-three/drei';

const geometry = new THREE.BoxGeometry(0.11, 0.07, 0.17)
const leaderMaterial = new THREE.MeshStandardMaterial({ color: 'gold' })
const baseMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })
const selectedMaterial = new THREE.MeshStandardMaterial({ color: 'skyblue' })



interface RobotProps {
  robot: RobotData;
  selected: boolean;
  onClick: () => void;
}

function Robot({ robot, selected, onClick } : RobotProps) {

  const { nodes } = useGLTF('/src/assets/robot.gltf') as any;

  const meshRef = useRef<THREE.Mesh>(null)

  return (
    // <Select enabled={selected}>
    <group
        receiveShadow
        onClick={onClick}
        ref={meshRef}
        scale={[0.001, 0.001, 0.001]}
        
        position={[robot.position.x, 0.017, robot.position.y]} // Position the cone above the ground
        rotation={[0, robot.orientation - Math.PI/2, 0]} // Keep the rotation around the Y-axis
      >
      <mesh
          geometry={nodes.robot_1.geometry}
          material={robot.isLeader ? leaderMaterial : selected ? selectedMaterial : baseMaterial}
        />
       <mesh
          geometry={nodes.robot_2.geometry}
          material={robot.isLeader ? leaderMaterial : selected ? selectedMaterial : baseMaterial}
        />
         <mesh
          geometry={nodes.robot.geometry}
          material={robot.isLeader ? leaderMaterial : selected ? selectedMaterial : baseMaterial}
        />
    </group>
    // </Select>
  );
};

export default Robot;