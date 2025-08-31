
import { Joystick } from "react-joystick-component";
import { useMQTT } from "../mqtt/MQTTStore";
import type { RobotData } from "../types/RobotData";
import type { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";
import { useRef, useState } from "react";

const size = 200;
const turnScale = 0.5; // Lower = smoother, less sensitive

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
                    //console.log(coordinates)
                    publishCoordinates(coordinates.relativeX, coordinates.relativeY, coordinates.distance);
                }
            }, 200);
            setIntervalId(id);

        }
    }

    // function handleMove(event: IJoystickUpdateEvent): void {
    //     if (selectedRobot) {
    //         const { x, y } = event;
    //         console.log(event)
    //     }
    // }

    function handleStop(): void {
        if (joystick.current) {
            if (intervalId) {
                publisher.publishMoveCommand(selectedRobot!.id, { left: 0, right: 0 });
                clearInterval(intervalId);
            }
        }
    }

    function publishCoordinates(relativeX: number, relativeY: number, distance: number): void {
        let x = relativeX / (size / 2) * (distance / 100);
        let y = - relativeY / (size / 2) * (distance / 100);

        let left = y + x * turnScale;
        let right = y - x * turnScale;

        //Clamp to [-1, 1] Not sure this is ever necessary 
        left = Math.max(-1, Math.min(1, left));
        right = Math.max(-1, Math.min(1, right));

        if (selectedRobot) {
            //leaving this for debug
            // TODO I think this is correct, and maybe the simulation is wrong
            console.log(`Publishing coordinates for Robot ${selectedRobot.id}:`, { left, right });
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
                                size={size}
                                stickSize={50}
                                baseColor="gray"
                                stickColor="black"
                                //move={handleMove}
                                start={handleStart}
                                stop={handleStop}
                                throttle={200}
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