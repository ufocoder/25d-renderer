import { Angle } from "@app/lib/Angle";
import { createRectangleLines } from "@app/lib/level";

const camera: Camera = {
  x: 70,
  y: 150,
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
  id: 1,
  floorHeight: 0,
  floorColor: "#444",
  ceilHeight: 10_000,
  ceilColor: "#87CEEB",
  segs: []
};

const room2: Sector = {
  id: 2,
  floorHeight: 0,
  floorColor: "#666",
  ceilHeight: 10_000,
  ceilColor: "#87CEEB",
  segs: []
};

const segs1 = createRectangleLines(120, 150, 150, 80, '#FF9500')
  .map(seg => {
    seg.frontSector = room1
    return seg;
  });

const segs2 = createRectangleLines(270, 150, 150, 80, '#FFCC00')
  .map(seg => {
    seg.frontSector = room2;
    return seg;
  });

segs1[1].backSector = room2;
segs1[1].isTwoSide = true

segs2[3].backSector = room1;
segs2[3].isTwoSide = true;

room1.segs = segs1;
room2.segs = segs2;

const level: Level = {
  linedefs: [...segs1, ...segs2],
  sectors: [room1, room2]
};

const settings: Settings = {
  camera,
  level,
};

export default settings;