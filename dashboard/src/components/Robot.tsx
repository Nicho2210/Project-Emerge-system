import * as THREE from 'three';
import type { RobotData } from '../types/RobotData';
import { useRef } from 'react';

const geometry = new THREE.BoxGeometry(0.11, 0.07, 0.17)
const leaderMaterial = new THREE.MeshStandardMaterial({ color: 'gold' })
const baseMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })

interface RobotProps {
  robot: RobotData;
  onClick: () => void;
}

function Robot({ robot, onClick } : RobotProps) {

  const meshRef = useRef<THREE.Mesh>(null)

  return (
   <mesh
      onClick={onClick}
      ref={meshRef}
      geometry={geometry}
      material={robot.isLeader ? leaderMaterial : baseMaterial}
      position={[robot.position.x, 0.035, robot.position.y]} // Position the cone above the ground
      rotation={[0, robot.orientation, 0]} // Keep the rotation around the Y-axis
    />
  );
};


export default Robot;