import { getPointSide } from "@app/stages/Stage3b/bsp/geometry";
import { traverseBSPTree } from "@app/stages/Stage3b/bsp/traverse";
import type { BSPLeaf, BSPNode } from "@app/stages/Stage3b/bsp/typings";
import { projectSegX, projectSegY, type ProjectionScreenX } from "./projection";


function isPortal(seg: Seg): boolean {
  return Boolean(seg.isTwoSide && seg.backSector && seg.backSector !== seg.frontSector);
}

interface SolidSegmentRange {
  xStart: number;
  xEnd: number;
}

function isWallVisible(x: number, ranges: SolidSegmentRange[]): boolean {
  for (const range of ranges) {
    if (x >= range.xStart && x <= range.xEnd) {
      return false;
    }
  }
  return true;
}

function addSolidRange(
  camera: Camera,
  xStart: number,
  xEnd: number,
  ranges: SolidSegmentRange[]
): SolidSegmentRange[] {
  xStart = Math.max(0, Math.floor(xStart));
  xEnd = Math.min(camera.screen.width, Math.ceil(xEnd));
  
  if (xStart >= xEnd) return [];
  
  const result: SolidSegmentRange[] = [];
  const sortedRanges = [...ranges].sort((a, b) => a.xStart - b.xStart);
  
  let currentX = xStart;
  
  for (const range of sortedRanges) {
    if (range.xEnd <= currentX) continue;
    
    if (currentX < range.xStart) {
      result.push({
        xStart: currentX,
        xEnd: Math.min(range.xStart, xEnd)
      });
    }
    
    currentX = Math.max(currentX, range.xEnd);
    if (currentX >= xEnd) break;
  }
  
  if (currentX < xEnd) {
    result.push({
      xStart: currentX,
      xEnd: xEnd
    });
  }
  
  for (const segment of result) {
    ranges.push(segment);
  }
  
  ranges.sort((a, b) => a.xStart - b.xStart);
  
  return result;
}

function drawVerticalLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  color: string
): void {
  if (topY >= bottomY) return;
  
  ctx.fillStyle = color;
  ctx.fillRect(x, topY, 1, bottomY - topY);
}

function createSolidWallRanges(camera: Camera) {
  const ranges: SolidSegmentRange[] = [];

  ranges.push({ xStart: Number.MIN_SAFE_INTEGER, xEnd: -1 });
  ranges.push({ xStart: camera.screen.width, xEnd: Number.MAX_SAFE_INTEGER });

  return ranges;
}

function drawSolidSegment(
  ctx: CanvasRenderingContext2D,
  camera: Camera, 
  seg: Seg,
  projectionX: ProjectionScreenX, 
  solidWallRanges: SolidSegmentRange[],
  upperClip: number[],
  lowerClip: number[],
) {
  const sector = seg.frontSector!;
  const wallColor = sector.wallColor!;
  const floorColor = sector.floorColor!;
  const ceilColor = sector.ceilColor!;

  const projectionY = projectSegY(camera, projectionX, sector, seg);

  const xStart = projectionX.start;
  const xEnd = projectionX.end;

  const startTop = projectionY.start.top;
  const startBottom = projectionY.start.bottom;
  const endTop = projectionY.end.top;
  const endBottom = projectionY.end.bottom;

  const xFrom = Math.max(0, Math.floor(Math.min(xStart, xEnd)));
  const xTo = Math.min(camera.screen.width - 1, Math.ceil(Math.max(xStart, xEnd)));

  for (let x = xFrom; x <= xTo; x++) {
    if (!isWallVisible(x, solidWallRanges)) {
      continue;
    }

    
    const t = (x - xStart) / (xEnd - xStart);
    const top = startTop + (endTop - startTop) * t;
    const bottom = startBottom + (endBottom - startBottom) * t;
    
    let drawTop = Math.max(upperClip[x], top);
    let drawBottom = Math.min(lowerClip[x], bottom);
    
    if (top >= bottom) {
      continue;
    }

    if (drawTop > upperClip[x]) {
      drawVerticalLine(ctx, x, Math.floor(upperClip[x]), Math.min(lowerClip[x], drawTop), ceilColor);
    }

    drawVerticalLine(ctx, x, drawTop, drawBottom, wallColor);

    if (drawBottom < lowerClip[x]) {
      drawVerticalLine(ctx, x, Math.max(drawBottom, upperClip[x]), Math.ceil(lowerClip[x]), floorColor);
    }

    upperClip[x] = drawTop;
    lowerClip[x] = drawBottom;
  }

  addSolidRange(camera, xStart, xEnd, solidWallRanges);
}

type PortalWallType = 'none' | 'upper' | 'lower' | 'both';

function getPortalWallType(currentSector: Sector, otherSector: Sector): PortalWallType {
  const ceilDiff = currentSector.ceilHeight! - otherSector.ceilHeight!;
  const floorDiff = currentSector.floorHeight! - otherSector.floorHeight!;
  
  const hasUpper = Math.abs(ceilDiff) > 0.01;
  const hasLower = Math.abs(floorDiff) > 0.01;
  
  if (hasUpper && hasLower) return 'both';
  if (hasUpper) return 'upper';
  if (hasLower) return 'lower';

  return 'none';
}

function drawPortalSegment(
  ctx: CanvasRenderingContext2D,
  camera: Camera, 
  seg: Seg,
  projectionX: ProjectionScreenX, 
  solidWallRanges: SolidSegmentRange[],
  upperClip: number[],
  lowerClip: number[],
) {
  const frontSector = seg.frontSector!;
  const backSector = seg.backSector!;
  
  const xStart = projectionX.start;
  const xEnd = projectionX.end;
  const xFrom = Math.max(0, Math.floor(Math.min(xStart, xEnd)));
  const xTo = Math.min(camera.screen.width - 1, Math.ceil(Math.max(xStart, xEnd)));

  const cameraSide = getPointSide(seg, { x: camera.x, y: camera.y });
  const isFront = cameraSide >= 0;
  const currentSector = isFront ? frontSector : backSector;
  const otherSector = isFront ? backSector : frontSector;

  const frontProjectionY = projectSegY(camera, projectionX, frontSector, seg);
  const backProjectionY = projectSegY(camera, projectionX, backSector, seg);
  const portalWallType = getPortalWallType(currentSector, otherSector);

  for (let x = xFrom; x <= xTo; x++) {
    if (!isWallVisible(x, solidWallRanges)) {
      continue;
    }

    const t = (x - xStart) / (xEnd - xStart);

    let frontTop, frontBottom, backTop, backBottom;

    if (Math.abs(xEnd - xStart) < 0.001) {
      frontTop = frontProjectionY.start.top;
      frontBottom = frontProjectionY.start.bottom;
      backTop = backProjectionY.start.top;
      backBottom = backProjectionY.start.bottom;
    } else {
      frontTop = frontProjectionY.start.top + (frontProjectionY.end.top - frontProjectionY.start.top) * t;
      frontBottom = frontProjectionY.start.bottom + (frontProjectionY.end.bottom - frontProjectionY.start.bottom) * t;
      backTop = backProjectionY.start.top + (backProjectionY.end.top - backProjectionY.start.top) * t;
      backBottom = backProjectionY.start.bottom + (backProjectionY.end.bottom - backProjectionY.start.bottom) * t;
    }

    const portalTop = isFront ? frontTop : backTop;
    const portalBottom = isFront ? frontBottom : backBottom;
    const otherTop = isFront ? backTop : frontTop;
    const otherBottom = isFront ? backBottom : frontBottom;

    const oldTop = upperClip[x];
    const oldBottom = lowerClip[x];

    const drawTop = Math.max(oldTop, portalTop);
    const drawBottom = Math.min(oldBottom, portalBottom);

    if (drawTop >= drawBottom) {
      continue;
    }

    if (drawTop > oldTop) {
      drawVerticalLine(ctx, x, Math.floor(oldTop), drawTop, currentSector.ceilColor!);
      upperClip[x] = drawTop;
    }

    if (portalWallType === 'upper' || portalWallType === 'both') {
      const wallTop = drawTop;
      const wallBottom = Math.min(drawBottom, Math.max(drawTop, otherTop));
      if (wallTop < wallBottom) {
        drawVerticalLine(ctx, x, Math.floor(wallTop), Math.ceil(wallBottom), otherSector.wallColor!);
        upperClip[x] = wallBottom;
      }
    }

    if (portalWallType === 'lower' || portalWallType === 'both') {
      const wallTop = Math.max(drawTop, Math.min(drawBottom, otherBottom));
      const wallBottom = drawBottom;
      if (wallTop < wallBottom) {
        drawVerticalLine(ctx, x, Math.floor(wallTop), Math.ceil(wallBottom), otherSector.wallColor!);
        lowerClip[x] = wallTop;
      }
    }

    if (drawBottom < oldBottom) {
      drawVerticalLine(ctx, x, drawBottom, Math.ceil(oldBottom), currentSector.floorColor!);
      lowerClip[x] = drawBottom;
    }

    upperClip[x] = Math.max(upperClip[x], Math.max(drawTop, otherTop));
    lowerClip[x] = Math.min(lowerClip[x], Math.min(drawBottom, otherBottom));
  }
}

export function createRender25d({ bspTree }: { bspTree: BSPNode }) {
  return function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;
    const wallRanges = createSolidWallRanges(camera);
    const upperClip = new Array(camera.screen.width).fill(-1);
    const lowerClip = new Array(camera.screen.width).fill(camera.screen.height);

    traverseBSPTree(bspTree, camera, (bspNode: BSPLeaf) => {
      for (const seg of bspNode.segs) {
        const screenProjection = projectSegX(camera, seg);

        if (!screenProjection) {
          continue;
        }

        if (isPortal(seg)) {
          drawPortalSegment(ctx, camera, seg, screenProjection, wallRanges, upperClip, lowerClip);
        } else {
          drawSolidSegment(ctx, camera, seg, screenProjection, wallRanges, upperClip, lowerClip);
        }
      }
    });
  }
}

