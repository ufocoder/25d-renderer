import { getPointSide } from "@app/stages/Stage3b/bsp/geometry";
import { traverseBSPTree } from "@app/stages/Stage3b/bsp/traverse";
import type { BSPLeaf, BSPNode } from "@app/stages/Stage3b/bsp/typings";
import { calculateIntersectionAngles, projectSegX, projectSegY, toAngle, toDistance, type IntersectionAngles } from "./projection";
import { getTextureColor, textures, type Texture } from "./textures";

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

function getTextureOffsetX(seg: Seg, camera: Camera, screenX: number, texture: Texture): number {
  // Получаем углы для интерполяции
  const startAngle = toAngle(seg.start, camera).degrees;
  const endAngle = toAngle(seg.end, camera).degrees;
  
  // Нормализуем углы
  let start = startAngle;
  let end = endAngle;
  if (end < start) end += 360;
  
  // Находим угол для текущего экранного X
  const t = screenX / camera.screen.width;
  const viewAngle = camera.angle.degrees - camera.fov.degrees / 2 + camera.fov.degrees * t;
  let currentAngle = viewAngle;
  if (currentAngle < start) currentAngle += 360;
  
  // Интерполируем позицию на стене
  const wallT = Math.max(0, Math.min(1, (currentAngle - start) / (end - start)));
  
  // Вычисляем смещение текстуры
  const wallLength = toDistance(seg.start, seg.end);
  let texOffset = wallT * wallLength;
  
  // Применяем масштаб текстуры
  texOffset = (texOffset / wallLength) * texture.width * (1 / texture.scale);
  
  return texOffset;
}

function drawTexturedVerticalLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  texture: Texture,
  textureX: number,
  textureStartY: number,
  textureScaleY: number = 1
): void {
  if (topY >= bottomY) return;
  
  const height = bottomY - topY;
  
  for (let y = Math.floor(topY); y <= Math.ceil(bottomY); y++) {
    const t = (y - topY) / height;
    
    let texY = textureStartY + t * texture.height * textureScaleY;
    texY = texY % texture.height;
    if (texY < 0) texY += texture.height;
    
    const color = getTextureColor(texture, textureX, texY);
    
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function createSolidWallRanges(camera: Camera): SolidSegmentRange[] {
  const ranges: SolidSegmentRange[] = [];

  ranges.push({ xStart: Number.MIN_SAFE_INTEGER, xEnd: -1 });
  ranges.push({ xStart: camera.screen.width, xEnd: Number.MAX_SAFE_INTEGER });

  return ranges;
}

function drawSolidSegment(
  ctx: CanvasRenderingContext2D,
  camera: Camera, 
  seg: Seg,
  angles: IntersectionAngles, 
  solidWallRanges: SolidSegmentRange[],
  upperClip: number[],
  lowerClip: number[],
) {
  const sector = seg.frontSector!;
  const wallColor = sector.wallColor!;
  const floorColor = sector.floorColor!;
  const ceilColor = sector.ceilColor!;
  const wallTexture = sector.wallTexture ? textures[sector.wallTexture] : null;
  
  const wallWorldHeight = (sector.ceilHeight ?? 0) - (sector.floorHeight ?? 0);

  const projectionX = projectSegX(camera, angles);
  const projectionY = projectSegY(camera, projectionX, sector, seg);

  const xStart = projectionX.start;
  const xEnd = projectionX.end;
  
  if (Math.abs(xEnd - xStart) < 0.001) return;

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
    
    const drawTop = Math.max(upperClip[x], top);
    const drawBottom = Math.min(lowerClip[x], bottom);
    
    if (drawTop >= drawBottom) {
      continue;
    }

    // Рисуем потолок
    if (drawTop > upperClip[x]) {
      drawVerticalLine(ctx, x, Math.floor(upperClip[x]), Math.ceil(drawTop), ceilColor);
    }

    // Рисуем стену с текстурой
    if (wallTexture) {
      const textureOffsetX = getTextureOffsetX(seg, camera, x, wallTexture);
      
      const verticalT = (drawTop - top) / (bottom - top);
      const textureStartY = verticalT * wallWorldHeight * (1 / wallTexture.scale);
      
      drawTexturedVerticalLine(
        ctx, x, drawTop, drawBottom, 
        wallTexture, textureOffsetX, textureStartY, 1 / wallTexture.scale
      );
    } else {
      drawVerticalLine(ctx, x, Math.ceil(drawTop), Math.floor(drawBottom), wallColor);
    }

    // Рисуем пол
    if (drawBottom < lowerClip[x]) {
      drawVerticalLine(ctx, x, Math.floor(drawBottom), Math.ceil(lowerClip[x]), floorColor);
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
  angles: IntersectionAngles, 
  solidWallRanges: SolidSegmentRange[],
  upperClip: number[],
  lowerClip: number[],
) {
  const frontSector = seg.frontSector!;
  const backSector = seg.backSector!;
  
  const projectionX = projectSegX(camera, angles);
  const frontProjectionY = projectSegY(camera, projectionX, frontSector, seg);
  const backProjectionY = projectSegY(camera, projectionX, backSector, seg);

  const xStart = projectionX.start;
  const xEnd = projectionX.end;
  
  if (Math.abs(xEnd - xStart) < 0.001) return;
  
  const xFrom = Math.max(0, Math.floor(Math.min(xStart, xEnd)));
  const xTo = Math.min(camera.screen.width - 1, Math.ceil(Math.max(xStart, xEnd)));

  const cameraSide = getPointSide(seg, { x: camera.x, y: camera.y });
  const isFront = cameraSide >= 0;
  const currentSector = isFront ? frontSector : backSector;
  const otherSector = isFront ? backSector : frontSector;

  const wallTexture = otherSector.wallTexture ? textures[otherSector.wallTexture] : null;
  const portalWallType = getPortalWallType(currentSector, otherSector);
  
  const upperWallHeight = Math.abs(currentSector.ceilHeight! - otherSector.ceilHeight!);
  const lowerWallHeight = Math.abs(currentSector.floorHeight! - otherSector.floorHeight!);

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

    // Рисуем потолок текущего сектора (над порталом)
    if (drawTop > oldTop) {
      drawVerticalLine(ctx, x, Math.floor(oldTop), Math.ceil(drawTop), currentSector.ceilColor!);
      upperClip[x] = drawTop;
    }

    // Отрисовка верхней стены портала (upper)
    if (portalWallType === 'upper' || portalWallType === 'both') {
      const wallTop = drawTop;
      const wallBottom = Math.min(drawBottom, Math.max(drawTop, otherTop));
      
      if (wallTop < wallBottom && upperWallHeight > 0) {
        if (wallTexture) {
          const textureOffsetX = getTextureOffsetX(seg, camera, x, wallTexture);
          
          const tVertical = (wallTop - portalTop) / Math.max(0.001, otherTop - portalTop);
          const textureStartY = tVertical * upperWallHeight * (1 / wallTexture.scale);
          
          drawTexturedVerticalLine(
            ctx, x, wallTop, wallBottom, 
            wallTexture, textureOffsetX, textureStartY, 1 / wallTexture.scale
          );
        } else {
          drawVerticalLine(ctx, x, Math.floor(wallTop), Math.ceil(wallBottom), otherSector.wallColor!);
        }
        upperClip[x] = wallBottom;
      }
    }

    // Отрисовка нижней стены портала (lower)
    if (portalWallType === 'lower' || portalWallType === 'both') {
      const wallTop = Math.max(drawTop, Math.min(drawBottom, otherBottom));
      const wallBottom = drawBottom;
      
      if (wallTop < wallBottom && lowerWallHeight > 0) {
        if (wallTexture) {
          const textureOffsetX = getTextureOffsetX(seg, camera, x, wallTexture);
          
          const tVertical = (wallBottom - portalBottom) / Math.max(0.001, portalBottom - otherBottom);
          const textureStartY = tVertical * lowerWallHeight * (1 / wallTexture.scale);
          
          drawTexturedVerticalLine(
            ctx, x, wallTop, wallBottom, 
            wallTexture, textureOffsetX, textureStartY, 1 / wallTexture.scale
          );
        } else {
          drawVerticalLine(ctx, x, Math.floor(wallTop), Math.ceil(wallBottom), otherSector.wallColor!);
        }
        lowerClip[x] = wallTop;
      }
    }

    // Рисуем пол текущего сектора (под порталом)
    if (drawBottom < oldBottom) {
      drawVerticalLine(ctx, x, Math.floor(drawBottom), Math.ceil(oldBottom), currentSector.floorColor!);
      lowerClip[x] = drawBottom;
    }

    // Обновляем clip-массивы с учётом портальной стены
    if (portalWallType === 'upper' || portalWallType === 'both') {
      upperClip[x] = Math.max(upperClip[x], otherTop);
    }
    if (portalWallType === 'lower' || portalWallType === 'both') {
      lowerClip[x] = Math.min(lowerClip[x], otherBottom);
    }
  }
}

export function createRender25d({ bspTree }: { bspTree: BSPNode }) {
  return function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;
    const wallRanges = createSolidWallRanges(camera);
    const upperClip = new Array(camera.screen.width).fill(-Infinity);
    const lowerClip = new Array(camera.screen.width).fill(Infinity);

    traverseBSPTree(bspTree, camera, (bspNode: BSPLeaf) => {
      for (const seg of bspNode.segs) {
        const angles = calculateIntersectionAngles(seg, camera);

        if (!angles) {
          continue;
        }

        if (isPortal(seg)) {
          drawPortalSegment(ctx, camera, seg, angles, wallRanges, upperClip, lowerClip);
        } else {
          drawSolidSegment(ctx, camera, seg, angles, wallRanges, upperClip, lowerClip);
        }
      }
    });
  }
}