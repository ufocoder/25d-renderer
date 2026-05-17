import { Angle } from "@app/lib/Angle";
import { createCircleLines } from "@app/lib/level";

const camera: Camera = {
  x: 200,
  y: 80,
  fov: new Angle(45),
  angle: new Angle(90),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 1,
  rotationSpeed: 1,
};

const sector1 = {
  height: 10_000,
  floorHeight: 0,
  segs: createCircleLines(200, 150, 85, 8)
};

const sector2 = {
  height: 10_000,
  floorHeight: 0,
  segs: createCircleLines(200, 150, 10, 16)
}

const level: Level = {
  linedefs: [...sector2.segs, ...sector1.segs],
  sectors: [sector1, sector2]
}

const settings: Settings = {
  camera,
  level,
};

export default settings;
