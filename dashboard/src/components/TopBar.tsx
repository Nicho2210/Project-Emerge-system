import { useMQTT } from "../mqtt/MQTTStore";
import { useState, useEffect } from "react";

interface TopBarProps {
  onResetCamera: () => void;
}

function TopBar({ onResetCamera }: TopBarProps) {
  const { publisher } = useMQTT();

  // Neighborhood logic moved here
  const [neighborhoodType, setNeighborhoodType] = useState<string>("FULL");
  const [radius, setRadius] = useState<number>(1.0);
  const flaskUrl = "http://localhost:5000/neighborhood";

  useEffect(() => {
    fetch(flaskUrl)
      .then(res => res.json())
      .then(data => {
        setNeighborhoodType(data.type);
        setRadius(data.radius);
      })
      .catch(() => {});
  }, []);

  function updateNeighborhood(type: string, radiusValue?: number) {
    const body: any = { type };
    if (type === "RADIUS" && radiusValue !== undefined) {
      body.radius = radiusValue;
    }
    fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        setNeighborhoodType(data.type);
        setRadius(data.radius);
      });
  }

  return (
    <div className="top-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <select onChange={_ => publisher.publishProgramCommand((_.target as HTMLSelectElement).value)}>
          <option value="pointToLeader">Point to Leader</option>
          <option value="vShape">V Shape</option>
          <option value="lineShape">Line Shape</option>
          <option value="circleShape">Circle Shape</option>
          <option value="squareShape">Square Shape</option>
          <option value="stop">Stop</option>
        </select>
        <button onClick={onResetCamera} style={{ marginLeft: "1em" }}>Reset Camera</button>
      </div>
      {/* Neighborhood controls aligned right */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {neighborhoodType !== "FULL" && (
          <button onClick={() => updateNeighborhood("FULL")}>
            Set FULL Neighborhood
          </button>
        )}
        {neighborhoodType === "FULL" && (
          <form
            onSubmit={e => {
              e.preventDefault();
              updateNeighborhood("RADIUS", radius);
            }}
            style={{ display: "flex", alignItems: "center", marginLeft: "1em" }}
          >
            <input
              className="input-number"
              type="number"
              step="any"
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              style={{ width: "80px", marginRight: "8px" }}
            />
            <button type="submit">Set RADIUS Neighborhood</button>
          </form>
        )}
        {neighborhoodType === "RADIUS" && (
          <form
            onSubmit={e => {
              e.preventDefault();
              updateNeighborhood("RADIUS", radius);
            }}
            style={{ display: "flex", alignItems: "center", marginLeft: "1em" }}
          >
            <input
              className="input-number"
              type="number"
              step="any"
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              style={{ width: "80px", marginRight: "8px" }}
            />
            <button type="submit">Update Radius</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default TopBar;
