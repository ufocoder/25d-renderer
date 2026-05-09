import { Angle } from "@app/lib/Angle";
import { createRectangleLines } from "@app/lib/level";

const camera: Camera = {
  x: 70,
  y: 70,
  z: 16,
  fov: new Angle(45),
  angle: new Angle(0),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 3,
  rotationSpeed: 2,
};

const room1: Sector = {
  floorHeight: 0,
  floorColor: "#8B6914",
  ceilHeight: 2_000,
  ceilColor: "#87CEEB",
  segs: createRectangleLines(120, 70, 150, 80)
};

const room2: Sector = {
  floorHeight: 0,
  floorColor: "#8B6914",
  ceilHeight: 2_000,
  ceilColor: "#87CEEB",
  segs: createRectangleLines(270, 70, 150, 80)
};

const level: Level = {
  linedefs: [...room1.segs, ...room2.segs],
  sectors: [room1, room2]
};

const settings: Settings = {
  camera,
  level,
};

export default settings;