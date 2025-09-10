// import { Canvas } from '@react-three/fiber';
import { useMemo, useRef, useEffect, useState } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line as ThreeLine } from 'three';
import type { RobotData } from '../types/RobotData';
// import { color } from 'three/tsl';

interface ReusableLineProps {
  points: Vector3[];
  color?: string;
}


// function NeighborLines({robots} : {robots: RobotData[]}){

//   return <></>;
// }

class NeighborCouple {
  robotA: number;
  robotB: number;
  points: Vector3[];

  constructor(robotA: number, robotB: number, points: Vector3[]) {
    // Ensure consistent ordering to avoid duplicates
    if (robotA < robotB) {
      this.robotA = robotA;
      this.robotB = robotB;
    }
    else {
      this.robotA = robotB;
      this.robotB = robotA;
    }
    this.points = points;
  }

  updatePositions(xA: number, yA: number, xB: number, yB: number) {
    this.points = [
      new Vector3(xA, 0, yA),
      new Vector3(xB, 0, yB),
    ];
  }

  isPresent(robotId: number): boolean {
    return this.robotA === robotId || this.robotB === robotId;
  }

  equals(other: NeighborCouple): boolean {
    return this.robotA === other.robotA && this.robotB === other.robotB;
  }

  hashCode(): string {
    return `${this.robotA}-${this.robotB}`;
  }

}

function NeighborLines({ robots }: { robots: RobotData[] }) {
  // Persistent storage for couples
  const couplesRef = useRef<Map<string, NeighborCouple>>(new Map());
  const [couples, setCouples] = useState<NeighborCouple[]>([]);

  useEffect(() => {
    const currentCouples = couplesRef.current;
    const seenHashes = new Set<string>();

    robots.forEach((r) => 
      r.neighbors?.forEach((nId) => {
        const neighbor = robots.find((robot) => robot.id === nId);
        if (neighbor) {
          const couple = new NeighborCouple(
            r.id,
            nId,
            [
              new Vector3(r.position.x, 0, r.position.y),
              new Vector3(neighbor.position.x, 0, neighbor.position.y),
            ]
          );
          const hash = couple.hashCode();
          seenHashes.add(hash);

          if (currentCouples.has(hash)) {
            // Update positions only
            currentCouples.get(hash)!.updatePositions(
              r.position.x, r.position.y,
              neighbor.position.x, neighbor.position.y
            );
          } else {
            // Add new couple
            currentCouples.set(hash, couple);
          }
        }
      })
    );

    // Remove couples that are no longer present
    for (const hash of Array.from(currentCouples.keys())) {
      if (!seenHashes.has(hash)) {
        currentCouples.delete(hash);
      }
    }
    setCouples(Array.from(currentCouples.values()));
  }, [robots]);

  return (
    <>
      {couples.map((couple, _) => (
        <Line key={couple.hashCode()} points={couple.points} color="green" />
      ))}
    </>
  );
}

const Line: React.FC<ReusableLineProps> = ({ points, color = 'red' }) => {
  // Memoize geometry to reuse across renders
  const geometry = useMemo<BufferGeometry>(() => {
    const geom = new BufferGeometry();
    const vertices = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
    geom.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    return geom;
  }, [points]);

  // Memoize material to reuse across renders
  const material = useMemo<LineBasicMaterial>(() => new LineBasicMaterial({ color }), [color]);

  return <primitive object={new ThreeLine(geometry, material)} />;
};

export default NeighborLines;
