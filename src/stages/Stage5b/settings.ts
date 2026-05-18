import { Angle } from "@app/lib/Angle";
import type { Color } from "../Stage5a/textures";

const colors: Record<string, Color> = {
  "#777": { r: 119, g: 119, b: 119 },
  "#999": { r: 153, g: 153, b: 153 },
  "#333": { r: 51, g: 51, b: 51 },
  "red": { r: 255, g: 0, b: 0 },
  "green": { r: 0, g: 255, b: 0 },
};

const camera: Camera = {
  x: 1,  
  y: 1,
  z: 200,
  height: 200,
  fov: new Angle(45),
  angle: new Angle(45),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 0.05,
  rotationSpeed: 2,
  riseSpeed: 10,
};

const roomSector: Sector = {
  id: 0,
  floorHeight: 0,
  floorColor: colors["#777"],
  floorTexture: 'floor',
  ceilHeight: 400,
  ceilColor: colors["#999"],
  wallColor: colors["#333"],
  wallTexture: 'wall',
  segs: []
};

const createRect = (x: number, y: number, xs: number, ys: number, isTwoSide: boolean, isSolid: boolean, frontSector: Sector, backSector?: Sector): Seg[] => ([
  { start: { x, y }, end: { x: x + xs, y }, isTwoSide, isSolid, frontSector, backSector },
  { start: { x: x + xs, y }, end: { x: x + xs, y: y + ys }, isTwoSide, isSolid, frontSector, backSector },
  { start: { x: x + xs, y: y + ys }, end: { x: x, y: y + ys }, isTwoSide, isSolid, frontSector, backSector },
  { start: { x: x, y: y + ys }, end: { x, y }, isTwoSide, isSolid, frontSector, backSector },
]);

const roomSegs = createRect(0, 0, 4, 4, true, true, roomSector);
const level: Level = {
  linedefs: [
    ...roomSegs
  ],
  sectors: []
};

const settings: Settings = {
  camera,
  level,
};

export default settings;