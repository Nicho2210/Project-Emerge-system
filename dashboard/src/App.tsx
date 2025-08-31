import { useState } from "react";
import TopBar from "./components/TopBar";
import RobotScene from "./components/RobotScene";


function App() {
  const [selectedRobot, setSelectedRobot] = useState<null | number>(null);
  const [cameraTrigger, triggerCamera] = useState(0);

  const onRobotClick = (id: number | null) => {
    setSelectedRobot((selectedRobot) => (selectedRobot === id ? null : id));
  };

  return (
    <div id="app"> 
      <TopBar onResetCamera={() => triggerCamera(cameraTrigger + 1)} />
      <div className="main-content">
        <RobotScene onRobotClick={onRobotClick} cameraTrigger={cameraTrigger} />
      </div>

    </div>
  );
}

export default App;
