import { Angle } from "@app/lib/Angle";
import { createLine } from "@app/lib/level";

const camera: Camera = {
  x: 140,
  y: 280,
  fov: new Angle(60),
  angle: new Angle(320),
  screen: {
    width: 400,
    height: 320,
  },
  moveSpeed: 1.5,
  rotationSpeed: 1.2,
};

function createRandomPolygonColumn(x: number, y: number, radius: number): Linedef[] {
  const edges = Math.floor(Math.random() * 5) + 5;
  const vertices: Vertex[] = [];
  
  for (let i = 0; i < edges; i++) {
    const angle = (i / edges) * Math.PI * 2;
    const r = radius * (0.8 + Math.random() * 0.4);
    vertices.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r
    });
  }
  
  const lines: Linedef[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % vertices.length];
    lines.push(createLine(start.x, start.y, end.x, end.y));
  }
  
  return lines;
}

function createPentagon(x: number, y: number, size: number): Linedef[] {
  const vertices: Vertex[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    vertices.push({
      x: x + Math.cos(angle) * size,
      y: y + Math.sin(angle) * size
    });
  }
  
  const lines: Linedef[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % vertices.length];
    lines.push(createLine(start.x, start.y, end.x, end.y));
  }
  
  return lines;
}

function createHexagon(x: number, y: number, size: number): Linedef[] {
  const vertices: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    vertices.push({
      x: x + Math.cos(angle) * size,
      y: y + Math.sin(angle) * size
    });
  }
  
  const lines: Linedef[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % vertices.length];
    lines.push(createLine(start.x, start.y, end.x, end.y));
  }
  
  return lines;
}

const room1Walls: Linedef[] = [
  createLine(60, 60, 300, 60),
  createLine(300, 60, 300, 150),
  createLine(300, 210, 300, 340),
  createLine(300, 340, 60, 340),
  createLine(60, 340, 60, 60),
];

const room1ExtraWalls: Linedef[] = [
  createLine(120, 60, 120, 120),
  createLine(240, 300, 240, 340),
  createLine(60, 180, 120, 180),
];

const room1Column: Linedef[] = createPentagon(180, 200, 30);

const corridorWalls: Linedef[] = [
  createLine(300, 150, 380, 150),
  createLine(300, 210, 380, 210),
];

const room2Walls: Linedef[] = [
  createLine(380, 150, 380, 60),
  createLine(380, 60, 600, 60),
  createLine(600, 60, 600, 340),
  createLine(600, 340, 380, 340),
  createLine(380, 340, 380, 210),
];

const room2ExtraWalls: Linedef[] = [
  createLine(450, 60, 450, 100),
  createLine(550, 300, 550, 340),
  createLine(380, 120, 430, 120),
  createLine(530, 280, 600, 280),
];

const room2Columns: Linedef[] = [
  ...createHexagon(480, 130, 22),
  ...createRandomPolygonColumn(540, 220, 20),
  ...createPentagon(440, 280, 25),
  ...createRandomPolygonColumn(560, 170, 18),
];

const linedefs: Linedef[] = [
  ...room1Walls,
  ...room1ExtraWalls,
  ...room1Column,
  ...corridorWalls,
  ...room2Walls,
  ...room2ExtraWalls,
  ...room2Columns,
];

const settings: Settings = {
  camera,
  level: {
    linedefs,
  },
};

export default settings;