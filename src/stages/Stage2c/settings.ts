import { Angle } from "@app/lib/Angle";
import { createCircleLines } from "@app/lib/level";

const camera: Camera = {
  x: 180,
  y: 70,
  z: 16,
  fov: new Angle(45),
  angle: new Angle(115),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 1,
  rotationSpeed: 1,
};

const sector1 = {
  floorHeight: 0,
  ceilHeight: 10_000,
  segs: createCircleLines(150, 130, 85, 8)
};

const sector2 = {
  floorHeight: 0,
  ceilHeight: 7_500,
  segs: createCircleLines(150, 130, 10, 10)
};

const sector3 = {
  floorHeight: 0,
  ceilHeight: 5_000,
  segs: createCircleLines(150, 130, 15, 10)
};

const sector4 = {
  floorHeight: 0,
  ceilHeight: 2_500,
  segs: createCircleLines(150, 130, 20, 10)
};

const level: Level = {
  linedefs: [
    ...sector1.segs, 
    ...sector2.segs,
    ...sector3.segs, 
    ...sector4.segs,
  ],
  sectors: [sector1, sector2, sector3, sector4]
}

const settings: Settings = {
  camera,
  level,
};

export default settings;
