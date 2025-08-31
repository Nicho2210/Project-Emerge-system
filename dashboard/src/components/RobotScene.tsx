import { Canvas, invalidate } from "@react-three/fiber";
import Ground from "./Ground";
import { useEffect, useState } from "react";
import { useMQTT } from "../mqtt/MQTTStore";
import ResettableCamera from "./ResettableCamera";
import type { RobotData } from "../types/RobotData";
import Robot from "./Robot";

interface RobotSceneProps {
    onRobotClick: (id: number | null) => void;
    cameraTrigger: number;
}

function RobotScene({ onRobotClick, cameraTrigger }: RobotSceneProps) {
    const [robots, setRobots] = useState<RobotData[]>([]);

    const { eventStream } = useMQTT();
    useEffect(() => {
    eventStream.subscribe((robots) => {
        setRobots(robots)
        });
        return () => {
        eventStream.cleanup();
        };
    }, []);

    return (
    <Canvas
        shadows
        frameloop="demand"
        onPointerMissed={() => onRobotClick(null)}
        camera={{ position: [3, 5, -3], fov: 60, far: 3000}}
    >
        <Ground />
        <axesHelper args={[500]} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <ambientLight intensity={0.2} />
        <ResettableCamera trigger={cameraTrigger} />

        {robots.map((robot) => (
            <Robot key={robot.id} robot={robot} onClick={() => onRobotClick(robot.id)} />
        ))}

    </Canvas>
    )
}

export default RobotScene;