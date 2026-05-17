export interface Color {
  r: number
  g: number
  b: number
}

export type Texture = {
  width: number;
  height: number;
  bitmap: number[][];
  colors: Color[];
  scale: number;
}

export const textures: Record<string, Texture> = {
  floor: {
    scale: 2,
    width: 4,
    height: 4,
    bitmap: [
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    colors: [
      { r: 120, g: 120, b: 120 },
      { r: 90, g: 90, b: 90 },
    ],
  },
  wall: {
    scale: 0.25,
    width: 4,
    height: 4,
    bitmap: [
      [0, 0, 1, 1],
      [0, 0, 1, 1],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      /*
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 0, 0, 1, 0, 0],
      */
    ],
    colors: [
      { r: 120, g: 200, b: 120 },
      { r: 200, g: 100, b: 100 },
    ],
  },
};
