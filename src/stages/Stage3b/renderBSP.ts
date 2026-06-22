import { drawLinedef } from "@app/lib/canvas";
import { buildBSPTree } from "./bsp/build";
import {
  extendToInfiniteLine,
  getPointSide,
  lineIntersectionWithRay,
  orderPolygonVertices,
  uniquePoints,
} from "./bsp/geometry";
import type { BSPNode } from "./bsp/typings";

const regionColors = [
  '#ff9500',
  '#ffcc00',
  '#34c759',
  '#00c7be',
  '#5ac8fa',
  '#ff3b30',
  '#007aff',
  '#af52de',
  '#ff2d55',
  '#a2845e',
];

function clipPolygonByLine(
  polygon: Vertex[],
  splitter: Seg,
  keepFront: boolean,
): Vertex[] {
  const result: Vertex[] = [];
  const infiniteLine = extendToInfiniteLine(splitter);

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const currentSide = getPointSide(splitter, current);
    const nextSide = getPointSide(splitter, next);
    const currentInside = keepFront ? currentSide >= 0 : currentSide <= 0;
    const nextInside = keepFront ? nextSide >= 0 : nextSide <= 0;

    if (currentInside) {
      result.push(current);
    }

    if (currentInside !== nextInside) {
      const intersection = lineIntersectionWithRay(
        infiniteLine,
        { start: current, end: next },
        true,
      );

      if (intersection) {
        result.push({ x: intersection.x, y: intersection.y });
      }
    }
  }

  return uniquePoints(result);
}

function getRootPolygon(segs: Seg[]): Vertex[] {
  const outerSegs = segs.filter((seg) => !seg.isTwoSide);
  const polygon = orderPolygonVertices(outerSegs);

  if (polygon.length >= 3) {
    return polygon;
  }

  const points = uniquePoints(segs.flatMap((seg) => [seg.start, seg.end]));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
}

function drawRegion(
  ctx: CanvasRenderingContext2D,
  polygon: Vertex[],
  colorIndex: number | null,
) {
  if (polygon.length < 3) return;

  ctx.save();
  ctx.globalAlpha = colorIndex === null ? 1 : 0.42;
  ctx.fillStyle = colorIndex === null
    ? '#ffffff'
    : regionColors[colorIndex % regionColors.length];
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);

  for (const point of polygon.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.stroke();
  ctx.restore();
}

function drawSplitter(
  ctx: CanvasRenderingContext2D,
  splitter: Seg,
  polygon: Vertex[],
) {
  const points = polygon.filter(
    (point) => Math.abs(getPointSide(splitter, point)) < 0.001,
  );

  if (points.length < 2) return;

  const dx = splitter.end.x - splitter.start.x;
  const dy = splitter.end.y - splitter.start.y;
  const sortedPoints = [...points].sort((left, right) =>
    (left.x - splitter.start.x) * dx + (left.y - splitter.start.y) * dy -
    ((right.x - splitter.start.x) * dx + (right.y - splitter.start.y) * dy),
  );

  ctx.save();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.setLineDash([9, 6]);
  ctx.beginPath();
  ctx.moveTo(sortedPoints[0].x, sortedPoints[0].y);
  ctx.lineTo(
    sortedPoints[sortedPoints.length - 1].x,
    sortedPoints[sortedPoints.length - 1].y,
  );
  ctx.stroke();
  ctx.restore();
}

function drawSegmentDirection(
  ctx: CanvasRenderingContext2D,
  seg: Seg,
) {
  const dx = seg.end.x - seg.start.x;
  const dy = seg.end.y - seg.start.y;
  const length = Math.hypot(dx, dy);

  if (length < 4) return;

  const directionX = dx / length;
  const directionY = dy / length;
  const normalX = -directionY;
  const normalY = directionX;
  const arrowLength = Math.min(12, Math.max(7, length * 0.16));
  const arrowWidth = arrowLength * 0.55;
  const tip = {
    x: seg.start.x + dx * 0.58,
    y: seg.start.y + dy * 0.58,
  };
  const base = {
    x: tip.x - directionX * arrowLength,
    y: tip.y - directionY * arrowLength,
  };

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(
    base.x + normalX * arrowWidth,
    base.y + normalY * arrowWidth,
  );
  ctx.lineTo(
    base.x - normalX * arrowWidth,
    base.y - normalY * arrowWidth,
  );
  ctx.closePath();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function indexBranches(node: BSPNode, indexes: Map<BSPNode, number>) {
  if (node.kind === 'leaf') return;

  indexes.set(node, indexes.size + 1);
  indexBranches(node.front, indexes);
  indexBranches(node.back, indexes);
}

export function countBSPBranches(node: BSPNode): number {
  if (node.kind === 'leaf') return 0;
  return 1 + countBSPBranches(node.front) + countBSPBranches(node.back);
}

export function renderBSPAnimation(
  ctx: CanvasRenderingContext2D,
  settings: Settings,
  tree: BSPNode,
  splitStep: number,
) {
  const rootPolygon = getRootPolygon(settings.level.linedefs);
  const branchIndexes = new Map<BSPNode, number>();
  let regionIndex = 0;

  indexBranches(tree, branchIndexes);

  const renderNode = (node: BSPNode, polygon: Vertex[]) => {
    if (polygon.length < 3) return;

    if (node.kind === 'leaf') {
      drawRegion(ctx, polygon, regionIndex++);
      return;
    }

    const branchIndex = branchIndexes.get(node)!;

    if (branchIndex > splitStep) {
      drawRegion(ctx, polygon, null);
      return;
    }

    const frontPolygon = clipPolygonByLine(polygon, node.splitter, true);
    const backPolygon = clipPolygonByLine(polygon, node.splitter, false);

    renderNode(node.front, frontPolygon);
    renderNode(node.back, backPolygon);

    if (branchIndex === splitStep) {
      drawSplitter(ctx, node.splitter, polygon);
    }
  };

  renderNode(tree, rootPolygon);

  ctx.save();
  ctx.globalAlpha = 0.75;
  for (const seg of settings.level.linedefs) {
    drawLinedef(ctx, seg, '#111827', seg.isTwoSide ? 2 : 3);
  }
  ctx.restore();

  for (const seg of settings.level.linedefs) {
    drawSegmentDirection(ctx, seg);
  }
}

export default function renderBSP(
  ctx: CanvasRenderingContext2D,
  settings: Settings,
) {
  const tree = buildBSPTree(settings.level.linedefs);
  renderBSPAnimation(ctx, settings, tree, countBSPBranches(tree));
}
