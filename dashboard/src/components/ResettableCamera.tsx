import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";

function ResettableCamera({ trigger }: { trigger: number }) {

  const cameraControlsRef = useRef<CameraControls>(null);

  const defaultPosition: [number, number, number] = [1.5, 3, -1.5]
  const defaultLookAt: [number, number, number] = [1.5, 0, 1.5]

  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.setLookAt(...defaultPosition, ...defaultLookAt, true)
    }
  }, [trigger]);

  return (
      <CameraControls
          ref={cameraControlsRef}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.05}
        />
  )
}

export default ResettableCamera;