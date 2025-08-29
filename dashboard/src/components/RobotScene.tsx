import { Canvas } from "@react-three/fiber";
import Ground from "./Ground";
import { useEffect } from "react";
import { useMQTT } from "../mqtt/MQTTStore";
import ResettableCamera from "./ResettableCamera";

interface RobotSceneProps {
    onRobotClick: (id: number | null) => void;
    cameraTrigger: number;
}

function RobotScene({ onRobotClick, cameraTrigger }: RobotSceneProps) {
    const { eventStream } = useMQTT();
    useEffect(() => {
    eventStream.subscribe((message) => {
        console.log("Received message:", message);
        });
        return () => {
        eventStream.cleanup();
        };
    }, [eventStream]);

    return (
    <Canvas
        shadows
        onPointerMissed={() => onRobotClick(null)}
        camera={{ position: [3, 5, -3], fov: 60, far: 3000}}
    >
        <Ground />
        <axesHelper args={[500]} />
        <ResettableCamera trigger={cameraTrigger} />

    </Canvas>
    )
}

export default RobotScene;