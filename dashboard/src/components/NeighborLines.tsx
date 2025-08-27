import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RobotData } from '../types/RobotData';

function NeighborLines({ robots }: { robots: RobotData[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) {return;}
      // Dispose geometries and materials before removing lines
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        if (child instanceof THREE.Line) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose && mat.dispose());
            } else if (child.material.dispose) {
              child.material.dispose();
            }
          }
        }
        groupRef.current.remove(child);
      }

    robots.forEach((robot) => {
      const from = new THREE.Vector3(robot.position.x, 0, robot.position.y);
      robot.neighbors?.forEach(nid => {
        const neighbor = robots[nid];
        if (!neighbor) {return;}
        const to = new THREE.Vector3(neighbor.position.x, 0, neighbor.position.y);

        const points = [from, to];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 'red' });
        const line = new THREE.Line(geometry, material);
        groupRef.current?.add(line);
      });
    });
  });

  return <group ref={groupRef} />;
}

export default NeighborLines;
