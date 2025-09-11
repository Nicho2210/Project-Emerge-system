import React from "react";

export const FORMATION_TYPES = [
  { value: "pointToLeader", label: "Point to Leader" },
  { value: "vShape", label: "V Shape" },
  { value: "lineShape", label: "Line Shape" },
  { value: "circleShape", label: "Circle Shape" },
  { value: "squareShape", label: "Square Shape" },
  { value: "stop", label: "Stop" }
];

interface FormationPopupProps {
  selectedFormation: string;
  setSelectedFormation: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const FormationPopup: React.FC<FormationPopupProps> = ({
  selectedFormation,
  setSelectedFormation,
  onConfirm,
  onCancel
}) => (
  <div
    style={{
      position: "absolute",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#0710138f",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10em",
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    }}
  >
    <h3>Select Formation</h3>
    <select
      value={selectedFormation}
      onChange={e => setSelectedFormation(e.target.value)}
      style={{ marginBottom: "1em", width: "100%" }}
    >
      {FORMATION_TYPES.map(f => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  </div>
);

export default FormationPopup;