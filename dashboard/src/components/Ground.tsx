import { Grid } from "@react-three/drei"
import { memo } from "react"

const Ground = memo(() => {
  const gridConfig = {
    cellSize: 0.2,
    cellThickness: 0.5,
    cellColor: '#6f6f6f',
    sectionSize: 1,
    sectionThickness: 0.7,
    fadeDistance: 100,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, 0, 0]} args={[10, 10]} {...gridConfig} />
})

export default Ground;