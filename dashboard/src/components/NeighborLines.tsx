import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RobotData } from '../types/RobotData';

function NeighborLines({ robots }: { robots: RobotData[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    // Remove all children (lines) efficiently
    group.clear();

    // Pre-create dashed material for reuse
    const lineMaterial = new THREE.LineBasicMaterial({ color: 'lightgrey' });
    //new THREE.LineDashedMaterial({ color: 'grey', dashSize: 0.01, gapSize: 0.02});

    robots.forEach((robot) => {
      const from = new THREE.Vector3(robot.position.x, 0, robot.position.y);
      robot.neighbors?.forEach(nid => {
        const neighbor = robots[nid];
        if (!neighbor) return;
        const to = new THREE.Vector3(neighbor.position.x, 0, neighbor.position.y);
        const points = [from, to];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        line.computeLineDistances();
        group.add(line);
      });
    });
  });

  return <group ref={groupRef} />;
}

export default NeighborLines;
