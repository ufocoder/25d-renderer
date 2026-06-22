import {
  computeBounds,
  extendToInfiniteLine,
  generateSegId,
  getMidPoint,
  getPointSide,
  isConvexPolygon,
  lineIntersectionWithRay,
  orderPolygonVertices,
  resetSegIdCounter,
  splitSegment,
  uniquePoints,
} from "./geometry";

import type { BSPLeaf, BSPNode } from "./typings";

function invertSegment(seg: Seg): Seg {
  if (!isPortal(seg)) {
    return seg;
  }

  const inverted = { ...seg };
  
  inverted.frontSector = seg.backSector;
  inverted.backSector = seg.frontSector;

  if (inverted.frontSector === inverted.backSector) {
    inverted.isTwoSide = false;
  }

  return inverted;
}

function isPortal(seg: Seg): boolean {
  return Boolean(seg.isTwoSide && seg.backSector && seg.backSector !== seg.frontSector);
}

interface PartitionSegments {
  frontSegments: Seg[]; 
  backSegments: Seg[]; 
  onLineSegments: Seg[];
  newSegments: Seg[];
}

function getGeometryKey(seg: Seg): string {
  const scale = 1_000;
  const start = `${Math.round(seg.start.x * scale)}/${Math.round(seg.start.y * scale)}`;
  const end = `${Math.round(seg.end.x * scale)}/${Math.round(seg.end.y * scale)}`;
  return start < end ? `${start}:${end}` : `${end}:${start}`;
}

function uniqueGeometry(segs: Seg[]): Seg[] {
  const seen = new Set<string>();

  return segs.filter((seg) => {
    const geometryKey = getGeometryKey(seg);
    if (seen.has(geometryKey)) return false;
    seen.add(geometryKey);
    return true;
  });
}

function partitionByInfiniteLine(
  segs: Seg[],
  splitter: Seg,
): PartitionSegments {
  const frontSegments: Seg[] = [];
  const backSegments: Seg[] = [];
  const onLineSegments: Seg[] = [];
  const newSegments: Seg[] = [];
  
  const infiniteLine = extendToInfiniteLine(splitter);
  
  for (const seg of segs) {
    if (seg.id === splitter.id) {
      onLineSegments.push(seg);
      continue;
    }
    
    const intersection = lineIntersectionWithRay(infiniteLine, seg, true);
    
    if (!intersection) {
      const midPoint = getMidPoint(seg);
      const side = getPointSide(splitter, midPoint);
      
      if (side > 0) {
        frontSegments.push(seg);
      } else if (side < 0) {
        backSegments.push(seg);
      } else {
        onLineSegments.push(seg);
      }
      continue;
    }

    const isAtStart = Math.hypot(intersection.x - seg.start.x, intersection.y - seg.start.y) < 0.001;
    const isAtEnd = Math.hypot(intersection.x - seg.end.x, intersection.y - seg.end.y) < 0.001;
    
    if (isAtStart || isAtEnd) {
      const midPoint = getMidPoint(seg);
      const side = getPointSide(splitter, midPoint);
      
      if (side > 0) {
        frontSegments.push(seg);
      } else if (side < 0) {
        backSegments.push(seg);
      } else {
        onLineSegments.push(seg);
      }
      continue;
    }
    
    const [segA, segB] = splitSegment(seg, intersection);
    
    newSegments.push(segA, segB);
    
    const midA = {
      x: (segA.start.x + segA.end.x) / 2,
      y: (segA.start.y + segA.end.y) / 2
    };

    const sideA = getPointSide(splitter, midA);
    
    if (sideA > 0) {
      frontSegments.push(segA);
    } else if (sideA < 0) {
      backSegments.push(segA);
    } else {
      onLineSegments.push(segA);
    }
    
    const midB = {
      x: (segB.start.x + segB.end.x) / 2,
      y: (segB.start.y + segB.end.y) / 2
    };
    const sideB = getPointSide(splitter, midB);
    
    if (sideB > 0) {
      frontSegments.push(segB);
    } else if (sideB < 0) {
      backSegments.push(segB);
    } else {
      onLineSegments.push(segB);
    }
  }
  
  return { frontSegments, backSegments, onLineSegments, newSegments };
}

function canCreateLeaf(segs: Seg[], minSegments: number = 3): boolean {
  const boundarySegs = uniqueGeometry(segs);
  if (boundarySegs.length < minSegments) return false;
  if (!isConnectedPolygon(boundarySegs)) return false;
  
  return isConvexPolygon(boundarySegs);
}

function isConnectedPolygon(segs: Seg[]): boolean {
  if (segs.length === 0) return false;
  
  const vertexToSegs = new Map<string, Seg[]>();
  const norm = (x: number, y: number) => `${Math.round(x * 1000)}/${Math.round(y * 1000)}`;
  
  for (const seg of segs) {
    const startKey = norm(seg.start.x, seg.start.y);
    const endKey = norm(seg.end.x, seg.end.y);
    
    if (!vertexToSegs.has(startKey)) vertexToSegs.set(startKey, []);
    if (!vertexToSegs.has(endKey)) vertexToSegs.set(endKey, []);
    
    vertexToSegs.get(startKey)!.push(seg);
    vertexToSegs.get(endKey)!.push(seg);
  }
  
  for (const [_, segList] of vertexToSegs) {
    if (segList.length !== 2) return false;
  }
  
  if (vertexToSegs.size === 0) return false;
  
  const startVertex = Array.from(vertexToSegs.keys())[0];
  const visited = new Set<string>();
  const stack: string[] = [startVertex];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const segsAtVertex = vertexToSegs.get(current)!;
    for (const seg of segsAtVertex) {
      const startKey = norm(seg.start.x, seg.start.y);
      const endKey = norm(seg.end.x, seg.end.y);
      const neighbor = current === startKey ? endKey : startKey;
      
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  
  return visited.size === vertexToSegs.size;
}

function closeBoundary(segs: Seg[], sector: Sector | null): Seg[] {
  const boundarySegs = uniqueGeometry(segs);
  const scale = 1_000;
  const key = (point: Vertex) =>
    `${Math.round(point.x * scale)}/${Math.round(point.y * scale)}`;

  const maxIterations = boundarySegs.length * 2 + 10;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const pointByKey = new Map<string, Vertex>();
    const adjacency = new Map<string, Set<string>>();

    for (const seg of boundarySegs) {
      const startKey = key(seg.start);
      const endKey = key(seg.end);
      pointByKey.set(startKey, seg.start);
      pointByKey.set(endKey, seg.end);
      if (!adjacency.has(startKey)) adjacency.set(startKey, new Set());
      if (!adjacency.has(endKey)) adjacency.set(endKey, new Set());
      adjacency.get(startKey)!.add(endKey);
      adjacency.get(endKey)!.add(startKey);
    }

    const componentByKey = new Map<string, number>();
    let componentCount = 0;

    for (const startKey of adjacency.keys()) {
      if (componentByKey.has(startKey)) continue;
      const stack = [startKey];

      while (stack.length > 0) {
        const currentKey = stack.pop()!;
        if (componentByKey.has(currentKey)) continue;
        componentByKey.set(currentKey, componentCount);
        for (const nextKey of adjacency.get(currentKey) ?? []) {
          stack.push(nextKey);
        }
      }

      componentCount += 1;
    }

    const openPoints = [...adjacency.entries()]
      .filter(([, neighbors]) => neighbors.size % 2 === 1)
      .map(([pointKey]) => ({
        component: componentByKey.get(pointKey)!,
        point: pointByKey.get(pointKey)!,
      }));

    if (openPoints.length < 2) {
      return boundarySegs;
    }

    if (componentCount === 2 && openPoints.length === 4) {
      const firstComponent = openPoints[0].component;
      const firstPoints = openPoints.filter(
        ({ component }) => component === firstComponent,
      );
      const secondPoints = openPoints.filter(
        ({ component }) => component !== firstComponent,
      );

      if (firstPoints.length === 2 && secondPoints.length === 2) {
        const pairings = [
          [
            [firstPoints[0].point, secondPoints[0].point],
            [firstPoints[1].point, secondPoints[1].point],
          ],
          [
            [firstPoints[0].point, secondPoints[1].point],
            [firstPoints[1].point, secondPoints[0].point],
          ],
        ] as const;
        let bestPairing = pairings[0];
        let bestArea = -Infinity;

        for (const pairing of pairings) {
          const candidateSegs = [
            ...boundarySegs,
            ...pairing.map(([start, end]) => ({
              id: generateSegId(),
              start,
              end,
              frontSector: sector ?? undefined,
              backSector: sector ?? undefined,
              isPartition: true,
              isTwoSide: true,
            })),
          ];
          const vertices = orderPolygonVertices(candidateSegs);
          const area = Math.abs(vertices.reduce((sum, point, index) => {
            const next = vertices[(index + 1) % vertices.length];
            return sum + point.x * next.y - next.x * point.y;
          }, 0) / 2);

          if (vertices.length === candidateSegs.length && area > bestArea) {
            bestArea = area;
            bestPairing = pairing;
          }
        }

        let added = false;

        for (const [start, end] of bestPairing) {
          const partitionSeg: Seg = {
            id: generateSegId(),
            start,
            end,
            frontSector: sector ?? undefined,
            backSector: sector ?? undefined,
            isPartition: true,
            isTwoSide: true,
          };

          if (boundarySegs.some(
            (seg) => getGeometryKey(seg) === getGeometryKey(partitionSeg),
          )) {
            continue;
          }

          boundarySegs.push({
            ...partitionSeg,
          });
          added = true;
        }

        if (!added) return boundarySegs;
        continue;
      }
    }

    let bestPair: [number, number] | null = null;
    let bestDistance = Infinity;

    for (let left = 0; left < openPoints.length; left += 1) {
      for (let right = left + 1; right < openPoints.length; right += 1) {
        const sameComponent =
          openPoints[left].component === openPoints[right].component;

        if (componentCount > 1 && sameComponent) {
          continue;
        }

        const distance = Math.hypot(
          openPoints[right].point.x - openPoints[left].point.x,
          openPoints[right].point.y - openPoints[left].point.y,
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestPair = [left, right];
        }
      }
    }

    if (!bestPair || bestDistance < 0.001) {
      return boundarySegs;
    }

    const [left, right] = bestPair;
    const partitionSeg: Seg = {
      id: generateSegId(),
      start: openPoints[left].point,
      end: openPoints[right].point,
      frontSector: sector ?? undefined,
      backSector: sector ?? undefined,
      isPartition: true,
      isTwoSide: true,
    };

    if (boundarySegs.some(
      (seg) => getGeometryKey(seg) === getGeometryKey(partitionSeg),
    )) {
      return boundarySegs;
    }

    boundarySegs.push(partitionSeg);
  }

  return boundarySegs;
}

function getSectorForLeaf(segs: Seg[]): Sector | null {
  if (segs.length === 0) return null;

  const firstSeg = segs[0];
  
  if (firstSeg.frontSector) {
    return firstSeg.frontSector;
  }

  for (const seg of segs) {
    if (seg.frontSector) return seg.frontSector;
    if (seg.backSector) return seg.backSector;
  }
  
  return null;
}

function createLeaf(segs: Seg[], sector?: Sector | null): BSPLeaf {
  const uniqueSegs = segs.filter((seg, index, self) =>
    !seg.isPartition && index === self.findIndex((item) => item.id === seg.id)
  );

  let leafSector: Sector | null = sector || null;

  if (!leafSector) {
    leafSector = getSectorForLeaf(uniqueSegs);
  }
  
  if (!leafSector) {
    console.warn("Warning: Leaf created without sector reference");
    leafSector = {
      id: -1,
      floorHeight: 0,
      floorColor: "#333",
      ceilHeight: 10000,
      ceilColor: "#666",
      segs: []
    } as Sector;
  }

  const boundarySegs = closeBoundary(segs, leafSector);
  
  return {
    kind: 'leaf',
    segs: uniqueSegs,
    boundarySegs,
    bounds: computeBounds(boundarySegs)
  };
}

function getAvailableSplitters(segs: Seg[], usedSplitterIds: Set<number>): Seg[] {
  const twoSideSplitters = segs.filter(s =>
    !s.isPartition && s.isTwoSide === true && !usedSplitterIds.has(s.id!)
  );
  const oneSideSplitters = segs.filter(s =>
    !s.isPartition && s.isTwoSide === false && !usedSplitterIds.has(s.id!)
  );
  
  return [...twoSideSplitters, ...oneSideSplitters];
}

function evaluateSplitter(frontCount: number, backCount: number, isPortal: boolean): number {
  if (isPortal) {
    if (frontCount === 0 && backCount === 0) return Infinity;
    if (frontCount === 0) return backCount;
    if (backCount === 0) return frontCount;
    return Math.abs(frontCount - backCount);
  }

  if (frontCount === 0 || backCount === 0) return Infinity;

  return Math.abs(frontCount - backCount);
}

function selectBestSplitter(
  segs: Seg[],
  availableSplitters: Seg[],
): { splitter: Seg | null; front: Seg[]; back: Seg[]; onLine: Seg[]; newSegments: Seg[] } {
  let bestSplitter: Seg | null = null;
  let bestFront: Seg[] = [];
  let bestBack: Seg[] = [];
  let bestOnLine: Seg[] = [];
  let bestNewSegments: Seg[] = [];
  let bestScore = Infinity;
  
  for (const splitter of availableSplitters) {
    const { frontSegments, backSegments, onLineSegments, newSegments } = partitionByInfiniteLine(
      segs,
      splitter,
    );
    
    const score = evaluateSplitter(frontSegments.length, backSegments.length, isPortal(splitter));
    
    if (score < bestScore) {
      bestScore = score;
      bestSplitter = {...splitter};
      bestFront = frontSegments;
      bestBack = backSegments;
      bestOnLine = onLineSegments;
      bestNewSegments = newSegments;

      if (score === 0) break;
    }
  }
  
  return {
    splitter: bestSplitter,
    front: bestFront,
    back: bestBack,
    onLine: bestOnLine,
    newSegments: bestNewSegments
  };
}

function closeOpenChains(
  segs: Seg[],
  splitter: Seg,
  sector: Sector | null,
): Seg[] {
  const boundarySegs = uniqueGeometry(segs);
  const scale = 1_000;
  const pointByKey = new Map<string, Vertex>();
  const degreeByKey = new Map<string, number>();
  const key = (point: Vertex) =>
    `${Math.round(point.x * scale)}/${Math.round(point.y * scale)}`;

  for (const seg of boundarySegs) {
    for (const point of [seg.start, seg.end]) {
      const pointKey = key(point);
      pointByKey.set(pointKey, point);
      degreeByKey.set(pointKey, (degreeByKey.get(pointKey) ?? 0) + 1);
    }
  }

  const dx = splitter.end.x - splitter.start.x;
  const dy = splitter.end.y - splitter.start.y;
  const openPoints = [...degreeByKey.entries()]
    .filter(([pointKey, degree]) => {
      const point = pointByKey.get(pointKey)!;
      return degree % 2 === 1 && getPointSide(splitter, point) === 0;
    })
    .map(([pointKey]) => pointByKey.get(pointKey)!)
    .sort((a, b) =>
      (a.x - splitter.start.x) * dx + (a.y - splitter.start.y) * dy -
      ((b.x - splitter.start.x) * dx + (b.y - splitter.start.y) * dy),
    );

  const partitionSegs: Seg[] = [];

  for (let index = 0; index + 1 < openPoints.length; index += 2) {
    const start = openPoints[index];
    const end = openPoints[index + 1];

    if (Math.hypot(end.x - start.x, end.y - start.y) < 0.001) {
      continue;
    }

    partitionSegs.push({
      id: generateSegId(),
      start,
      end,
      frontSector: sector ?? splitter.frontSector,
      backSector: sector ?? splitter.backSector,
      isPartition: true,
      isTwoSide: true,
    });
  }

  return [...boundarySegs, ...partitionSegs];
}

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

function polygonToBoundarySegs(polygon: Vertex[]): Seg[] {
  return polygon.map((start, index) => ({
    id: generateSegId(),
    start,
    end: polygon[(index + 1) % polygon.length],
    isPartition: true,
    isTwoSide: true,
  }));
}

function assignLeafBoundaries(node: BSPNode, polygon: Vertex[]): void {
  if (node.kind === 'leaf') {
    if (polygon.length >= 3) {
      node.boundarySegs = polygonToBoundarySegs(polygon);
      node.bounds = computeBounds(node.boundarySegs);
    }
    return;
  }

  assignLeafBoundaries(
    node.front,
    clipPolygonByLine(polygon, node.splitter, true),
  );
  assignLeafBoundaries(
    node.back,
    clipPolygonByLine(polygon, node.splitter, false),
  );
}

function buildBSPTreeRecursive(
  segs: Seg[],
  usedSplitterIds: Set<number>,
  currentSector: Sector | null,
  depth: number,
  maxDepth: number,
  minSegments: number,
  onSplitDebug?: (data: any) => void
): { success: boolean; node?: BSPNode; newSegments?: Seg[] } {
  if (canCreateLeaf(segs, minSegments)) {
    return { 
      success: true,
      node: createLeaf(segs, currentSector)
    };
  }

  if (depth >= maxDepth) {
    return {
      success: true,
      node: createLeaf(segs, currentSector)
    };
  }

  const currentSplitters = getAvailableSplitters(segs, usedSplitterIds);
  
  if (currentSplitters.length === 0) {
    return {
      success: true, 
      node: createLeaf(segs, currentSector)
    };
  }

  const { splitter, front, back, onLine, newSegments } = selectBestSplitter(
    segs,
    currentSplitters,
  );
  
  if (!splitter) {
    return {
      success: true,
      node: createLeaf(segs, currentSector)
    };
  }
  
  if (front.length === 0 || back.length === 0) {
    return {
      success: true,
      node: createLeaf(segs, currentSector)
    };
  }

  const invertedOnLine = onLine.map(seg => invertSegment(seg));

  const frontSector = splitter.frontSector || currentSector;
  const backSector = splitter.backSector || currentSector;
  const frontSegs = closeOpenChains([...front, ...onLine], splitter, frontSector);
  const backSegs = closeOpenChains(
    [...back, ...invertedOnLine],
    splitter,
    backSector,
  );

  if (onSplitDebug) {
    onSplitDebug({ frontSegs, backSegs });
  }
  
  const newUsedSplitterIds = new Set(usedSplitterIds);
  newUsedSplitterIds.add(splitter.id!);
  
  const leftResult = buildBSPTreeRecursive(
    frontSegs,
    newUsedSplitterIds,
    frontSector,
    depth + 1,
    maxDepth,
    minSegments,
    onSplitDebug
  );
  
  if (!leftResult.success) {
    return { success: false };
  }
  
  const rightResult = buildBSPTreeRecursive(
    backSegs,
    newUsedSplitterIds,
    backSector,
    depth + 1,
    maxDepth,
    minSegments,
    onSplitDebug
  );
  
  if (!rightResult.success) {
    return { success: false };
  }

  const allNewSegments = [
    ...(leftResult.newSegments || []), 
    ...(rightResult.newSegments || []),
    ...newSegments
  ];
  
  return {
    success: true,
    node: {
      kind: 'branch',
      splitter: splitter,
      front: leftResult.node!,
      back: rightResult.node!
    },
    newSegments: allNewSegments
  };
}

export function buildBSPTree(
  segs: Seg[],
  maxDepth: number = 10,
  minSegments: number = 3,
  onSplitDebug?: (data: any) => void
): BSPNode {
  resetSegIdCounter();
  
  const segsWithId = segs.map(seg => ({
    ...seg,
    id: generateSegId()
  }));
  
  const usedSplitterIds = new Set<number>();
  
  const result = buildBSPTreeRecursive(
    segsWithId,
    usedSplitterIds,
    null,
    0,
    maxDepth,
    minSegments,
    onSplitDebug
  );
  
  if (!result.success || !result.node) {
    return createLeaf(segsWithId);
  }

  const outerSegs = segsWithId.filter((seg) => !seg.isTwoSide);

  if (isConnectedPolygon(outerSegs) && isConvexPolygon(outerSegs)) {
    assignLeafBoundaries(result.node, orderPolygonVertices(outerSegs));
  }
  
  return result.node;
}

export function collectLeaves(node: BSPNode): BSPLeaf[] {
  const leaves: BSPLeaf[] = [];
  
  function collect(n: BSPNode): void {
    if (n.kind === 'leaf') {
      leaves.push(n);
    } else {
      collect(n.front);
      collect(n.back);
    }
  }
  
  collect(node);

  return leaves;
}
