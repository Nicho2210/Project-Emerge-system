import { useState } from "react";
import TopBar from "./components/TopBar";
import RobotScene from "./components/RobotScene";
import ControlPanel from "./components/ControlPanel";


function App() {
  const [selectedRobotId, setSelectedRobot] = useState<null | number>(null);
  const [cameraTrigger, triggerCamera] = useState(0);

  const onRobotClick = (id: number | null) => {
    setSelectedRobot((selectedRobot) => (selectedRobot === id ? null : id));
  };

  return (
    <div id="app">
      <TopBar onResetCamera={() => triggerCamera(cameraTrigger + 1)} />
      <div className="main-content">
        <div className="scene">
          <RobotScene onRobotClick={onRobotClick} cameraTrigger={cameraTrigger} selectedRobotId={selectedRobotId} />
        </div>
        <div className="sidebar">
          <ControlPanel robotId={selectedRobotId} selectRobot={onRobotClick}/>
        </div>
      </div>
    </div>
  );
}

export default App;
