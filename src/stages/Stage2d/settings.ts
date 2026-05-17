import { Angle } from "@app/lib/Angle";
import { createRectangleLines } from "@app/lib/level";

const camera: Camera = {
  x: 50,
  y: 150,
  z: 16,
  fov: new Angle(45),
  angle: new Angle(0),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 2,
  rotationSpeed: 1,
};

const room1 = {
  floorHeight: 0,
  floorColor: "#8B6914",
  ceilHeight: 10_000,
  ceilColor: "#87CEEB",
  segs: createRectangleLines(120, 150, 150, 80)
};

const level: Level = {
  linedefs: [...room1.segs],
  sectors: [room1]
};

const settings: Settings = {
  camera,
  level,
};

export default settings;