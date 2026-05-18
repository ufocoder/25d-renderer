import { Angle } from "@app/lib/Angle";
import { drawAngleLine, drawPolygon } from "@app/lib/canvas";
import { buildBSPTree } from "@app/stages/Stage3b/bsp/build";
import { calculatePolygonCenter, sortPointsClockwise, uniquePoints } from "@app/stages/Stage3b/bsp/geometry";
import { traverseBSPTree } from "@app/stages/Stage3b/bsp/traverse";
import type { BSPLeaf, BSPNode } from "@app/stages/Stage3b/bsp/typings";

const RAY_LENGTH = 500;

const colors: string[] = [
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#00C7BE',
  '#5AC8FA',
  '#FF3B30',
  '#007AFF',
  '#AF52DE',
  '#FF2D55',
  '#A2845E',
];

function gerenateColor(index: number) {
  return colors[index % colors.length];
}

function scaleLinedef(linedef: Linedef, scale: number) {
  return {
    start: {
      x: linedef.start.x * scale,
      y: linedef.start.y * scale
    },
    end: {
      x: linedef.end.x * scale,
      y: linedef.end.y * scale
    },
  };
}

function drawLeaf(
  ctx: CanvasRenderingContext2D, 
  leaf: BSPLeaf,
  scale: number = 1,
  index: number = 0
): void {
  const points = sortPointsClockwise(uniquePoints(
    leaf.segs
      .map(seg => scaleLinedef(seg, scale))
      .map(seg => [seg.start, seg.end])
      .flat()
    ));

  const center = calculatePolygonCenter(points);
  const color = gerenateColor(index);

  drawPolygon(ctx, points, color);

  for (const point of points) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.fillStyle = "black"; 
  ctx.font = "17px Arial";
  ctx.fillText(String(index), center.x, center.y);
  ctx.restore();

}

export default function createRender2dStage3b(bspTree: BSPNode) {
  return function render2d(ctx: CanvasRenderingContext2D, settings: Settings, scale = 1) {
    
    const camera = settings.camera;
    const allSegments = settings.level.linedefs;

    if (!bspTree) {
      bspTree = buildBSPTree(allSegments, 10, 3);
    }

    let order = 0;
    traverseBSPTree(bspTree, camera, (bspNode: BSPLeaf) => {
      drawLeaf(ctx, bspNode, scale, ++order);
    });

    const halfFov = camera.fov.degrees / 2;
    const angle = camera.angle.degrees;

    drawAngleLine(ctx, camera.x * scale, camera.y * scale, new Angle(angle - halfFov), RAY_LENGTH);
    drawAngleLine(ctx, camera.x * scale, camera.y * scale, new Angle(angle), RAY_LENGTH);
    drawAngleLine(ctx, camera.x * scale, camera.y * scale, new Angle(angle + halfFov), RAY_LENGTH);
    
    ctx.fillStyle = "#00ff88";
    ctx.beginPath();
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    const lookX = camera.x * scale + Math.cos(camera.angle.radians) * 20;
    const lookY = camera.y * scale + Math.sin(camera.angle.radians) * 20;
    ctx.moveTo(camera.x * scale, camera.y * scale);
    ctx.lineTo(lookX, lookY);
    ctx.stroke();
  };
};
