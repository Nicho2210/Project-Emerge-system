import { Canvas, useThree } from '@react-three/fiber';
import { AccumulativeShadows, CameraControls, Grid, OrbitControls, RandomizedLight } from '@react-three/drei';
import NeighborLines from './NeighborLines';
import RobotShape from './RobotShape';
import type { RobotData } from '../types/RobotData';
import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';

function RobotScene({ robots, trigger, onRobotClick }: { robots: RobotData[]; trigger: number; onRobotClick: (id: number | null) => void }) {
  return (
      <Canvas 
        shadows
        onPointerMissed={() => onRobotClick(null)}
        camera={{ position: [3, 5, -3], fov: 60, far: 3000}}
      > 

        <CameraController trigger={trigger} />

        <Ground />
        <axesHelper args={[500]} />



        <NeighborLines robots={robots} />

        <group> 
          {robots.map((robot) => (
            <RobotShape key={robot.id} data={robot} onClick={(id) => {
              onRobotClick(id);
            }} />
          ))}
        </group>

      </Canvas>

  );
}


function CameraController({ trigger }: { trigger: number }) {

  const cameraControlsRef = useRef<CameraControls>(null);

  useEffect(() => {
      cameraControlsRef.current?.setLookAt(1.5,2,-1.5, 1.5,0,1.5, true)
  }, [trigger]);

  return (
    <group>
      <CameraControls
          ref={cameraControlsRef}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.05}
        />
      <directionalLight
          position={[10, 20, 10]}
          intensity={1}
      />
      <ambientLight intensity={0.2} />
    </group>
  )
}



function Ground() {
  const gridConfig = {
    cellSize: 0.2,
    cellThickness: 0.5,
    cellColor: '#6f6f6f',
    sectionSize: 1,
    sectionThickness: 0.7,
    fadeDistance: 100,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, 0, 0]} args={[10, 10]} {...gridConfig} />
}



export default RobotScene;
