import { Angle } from "@app/lib/Angle";
import { drawAngleLine, drawLinedef, drawPolygon } from "@app/lib/canvas";
import wait from "@app/lib/wait";
import { buildBSPTree } from "./bsp/build-async";
import { sortPointsClockwise, uniquePoints } from "./bsp/geometry";
import { traverseBSPTree } from "./bsp/traverse";
import type { BSPLeaf, BSPNode } from "./bsp/typings";

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

function drawBSPnodeBBox(
  ctx: CanvasRenderingContext2D, 
  segs: Seg[],
  scale: number = 1,
  index: number = 0
): void {
  const points = uniquePoints(
    segs
      .map(seg => scaleLinedef(seg, scale))
      .map(seg => [seg.start, seg.end])
      .flat()
    );

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  
  const rectPoints = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY }
  ];

  const color = gerenateColor(index);

  drawPolygon(ctx, rectPoints, color);
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

  const color = gerenateColor(index);

  drawPolygon(ctx, points, color);
}

let bspTree: BSPNode | null = null;
let order = 0;

export default async function render2d(ctx: CanvasRenderingContext2D, settings: Settings) {
  
  const scale = 1;
  const camera = settings.camera;
  const allSegments = settings.level.linedefs;

  const onSplitDebug = async (data: any) => {

    ctx.strokeStyle = '2px'
    drawLinedef(ctx, data.splitter, 'green', 5);

    await wait(2_000);

    for (const linedef of data.frontSegs) {
      drawLinedef(ctx, scaleLinedef(linedef, scale), 'red', 5);
    }

    for (const linedef of data.backSegs) {
      drawLinedef(ctx, scaleLinedef(linedef, scale), 'blue', 5);
    }

    await wait(2_000);

    //drawBSPnodeBBox(ctx, data.frontSegs, scale, order);
    drawBSPnodeBBox(ctx, data.backSegs, scale, ++order);

    await wait(2_000);
  }

  if (!bspTree) {
    bspTree = await buildBSPTree(allSegments, 10, 3, onSplitDebug);
  }

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
