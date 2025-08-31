import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line as ThreeLine } from 'three';
import type { RobotData } from '../types/RobotData';

interface ReusableLineProps {
  points: Vector3[];
  color?: string;
}


function NeighborLines({robots} : {robots: RobotData[]}){

  
  return <></>;
}


// function NeighborLines({ robots }: { robots: RobotData[] }) {
//   // Generate lines for each pair of neighbors
//   const lines = useMemo(() => {
//     const result: { points: Vector3[]; color?: string }[] = [];

//     robots.forEach((robot) => {
//       if (robot.neighbors) {
//         robot.neighbors.forEach((neighborId) => {
//           const neighbor = robots.find((r) => r.id === neighborId);
//           if (neighbor) {
//             result.push({
//               points: [
//                 new Vector3(robot.position.x, 0, robot.position.y),
//                 new Vector3(neighbor.position.x, 0, neighbor.position.y),
//               ],
//             });
//           }
//         });
//       }
//     });

//     return result;
//   }, [robots]);

//   return (
//     <>
//       {lines.map((line, index) => (
//         <Line key={index} points={line.points} color={line.color} />
//       ))}
//     </>
//   );
// }

// const Line: React.FC<ReusableLineProps> = ({ points, color = 'red' }) => {
//   // Memoize geometry to reuse across renders
//   const geometry = useMemo<BufferGeometry>(() => {
//     const geom = new BufferGeometry();
//     const vertices = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
//     geom.setAttribute('position', new Float32BufferAttribute(vertices, 3));
//     return geom;
//   }, [points]);

//   // Memoize material to reuse across renders
//   const material = useMemo<LineBasicMaterial>(() => new LineBasicMaterial({ color }), [color]);

//   return <primitive object={new ThreeLine(geometry, material)} />;
// };

export default NeighborLines;