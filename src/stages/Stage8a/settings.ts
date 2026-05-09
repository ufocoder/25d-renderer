import { Angle } from "@app/lib/Angle";

const camera: Camera = {
  x: 75,  
  y: 75,
  z: 2_000,
  height: 2_000,
  fov: new Angle(45),
  angle: new Angle(0),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 3,
  rotationSpeed: 2,
};

const roomSector: Sector = {
  id: 0,
  floorHeight: 0,
  floorColor: "#777",
  ceilHeight: 30_000,
  ceilColor: "#999",
  wallColor: "#333",
  wallTexture: 'wall',
  segs: []
};

const createRect = (x: number, y: number, xs: number, ys: number, isTwoSide: boolean, isSolid: boolean, frontSector: Sector, backSector?: Sector): Seg[] => ([
  { start: { x, y }, end: { x: x + xs, y }, isTwoSide, isSolid, frontSector, backSector },
  { start: { x: x + xs, y }, end: { x: x + xs, y: y + ys }, isTwoSide, isSolid, frontSector, backSector },
  { start: { x: x + xs, y: y + ys }, end: { x: x, y: y + ys }, isTwoSide, isSolid, frontSector, backSector },
  { start: { x: x, y: y + ys }, end: { x, y }, isTwoSide, isSolid, frontSector, backSector },
]);

const segs = createRect(50, 50, 200, 200, false, true, roomSector)

const level: Level = {
  linedefs: [
    ...segs,
  ],
  sectors: []
};

const settings: Settings = {
  camera,
  level,
};

export default settings;