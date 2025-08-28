import type { CommandPublisher } from "../utils/CommandPublisherInterface";

interface TopBarProps {
  onResetCamera: () => void; // Added onResetCamera prop type
  commandPublisher: CommandPublisher
}

function TopBar({onResetCamera, commandPublisher }: TopBarProps) {
  return (
    <div className="top-bar">
      <select onChange={_ => commandPublisher.publishProgramCommand((_.target as HTMLSelectElement).value)}>
        <option value="pointToLeader">Point to Leader</option>
        <option value="vShape">V Shape</option>
        <option value="lineShape">Line Shape</option>
        <option value="circleShape">Circle Shape</option>
        <option value="squareShape">Square Shape</option>
        <option value="stop">Stop</option>
      </select>
      <button onClick={onResetCamera}>Reset Camera</button> 
    </div>
  );
}

export default TopBar;
