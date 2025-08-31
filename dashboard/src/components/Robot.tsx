import * as THREE from 'three';
import type { RobotData } from '../types/RobotData';
import { useRef, useState } from 'react';
import { Select } from '@react-three/postprocessing';

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

  const meshRef = useRef<THREE.Mesh>(null)

  return (
    // <Select enabled={selected}>
      <mesh
          onClick={onClick}
          ref={meshRef}
          geometry={geometry}
          material={robot.isLeader ? leaderMaterial : selected ? selectedMaterial : baseMaterial}
          position={[robot.position.x, 0.035, robot.position.y]} // Position the cone above the ground
          rotation={[0, robot.orientation, 0]} // Keep the rotation around the Y-axis
        />
    // </Select>
  );
};

export default Robot;