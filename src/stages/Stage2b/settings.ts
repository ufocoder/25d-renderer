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
  segs: createCircleLines(200, 150, 85, 8)
};

const sector2 = {
  height: 7_500,
  segs: createCircleLines(200, 150, 10, 10)
};

const sector3 = {
  height: 5_000,
  segs: createCircleLines(200, 150, 15, 10)
};

const sector4 = {
  height: 2_500,
  segs: createCircleLines(200, 150, 20, 10)
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
