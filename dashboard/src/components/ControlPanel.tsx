
import { Joystick } from "react-joystick-component";
import { useMQTT } from "../mqtt/MQTTStore";
import type { RobotData } from "../types/RobotData";
import { useRef, useState } from "react";

const joystickSize = 200;
const turnScale = 0.3; // Lower = smoother, less sensitive
const joystickUpdateFrequency = 200; //ms

function ControlPanel({ robotId }: { robotId: number }) {
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const { robots, publisher } = useMQTT();
    const joystick = useRef<Joystick | null>(null);

    const selectedRobot: RobotData | undefined = robots.find(robot => robot.id === robotId);

    function handleStart(): void {
        if (joystick.current) {
            let id = setInterval(() => {
                let coordinates = joystick.current?.state.coordinates;
                if (coordinates) {
                    publishCoordinates(coordinates.relativeX, coordinates.relativeY, coordinates.distance);
                }
            }, joystickUpdateFrequency);
            setIntervalId(id);

        }
    }

    function handleStop(): void {
        if (joystick.current) {
            if (intervalId) {
                publisher.publishMoveCommand(selectedRobot!.id, { left: 0, right: 0 });
                clearInterval(intervalId);
            }
        }
    }

    function publishCoordinates(relativeX: number, relativeY: number, distance: number): void {
        let x = relativeX / (joystickSize / 2) * (distance / 100);
        let y = - relativeY / (joystickSize / 2) * (distance / 100);

        let left = y + x * turnScale;
        let right = y - x * turnScale;

        const maxMag = Math.max(1, Math.abs(left), Math.abs(right));
        left /= maxMag;
        right /= maxMag;

        if (selectedRobot) {
            publisher.publishMoveCommand(selectedRobot.id, { left, right });
        }
    }

    return (
        <div className="control-panel">
            {selectedRobot && (
                <>
                    <h2>Robot {selectedRobot.id}</h2>
                    <div>Position:</div>
                    <div style={{ marginLeft: '15px' }}>X: {selectedRobot.position.x.toFixed(3)}</div>
                    <div style={{ marginLeft: '15px' }}>Z: {selectedRobot.position.y.toFixed(3)}</div>
                    <p>Rotation: {orientation2Degrees(selectedRobot.orientation)}</p>
                    <div className="controls">
                        <div id="joystick">
                            <Joystick
                                ref={joystick}
                                size={joystickSize}
                                stickSize={50}
                                baseColor="gray"
                                stickColor="black"
                                start={handleStart}
                                stop={handleStop}
                            />
                        </div>

                    </div>
                    <button onClick={() => publisher.publishLeaderCommand(selectedRobot.id)}>
                        Make Leader
                    </button>
                </>
            )}
        </div>
    );
}


function orientation2Degrees(orientation: number): number {
    return Number((orientation * (180 / Math.PI)).toFixed(1));
}

export default ControlPanel;