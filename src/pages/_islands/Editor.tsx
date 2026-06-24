import {
  createEffect,
  createMemo,
  createSignal,
  For,
} from 'solid-js';

type EditorMode = 'line' | 'sector' | 'portal' | 'delete';

type EditorPoint = {
  id: number;
  x: number;
  y: number;
};

type EditorLine = {
  id: number;
  startId: number;
  endId: number;
};

type SectorEdge = {
  lineId: number;
  reversed: boolean;
};

type EditorSector = {
  id: number;
  edges: SectorEdge[];
  floorColor: string;
  ceilColor: string;
  wallColor: string;
};

type SerializableSeg = {
  lineId: number;
  start: Vertex;
  end: Vertex;
  isTwoSide: boolean;
  frontSectorId: number;
  backSectorId?: number;
};

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 520;
const GRID_SIZE = 20;
const SNAP_RADIUS = 10;
const LINE_PICK_RADIUS = 8;
const SECTOR_COLORS = [
  { floor: '#919191', ceil: '#454545', wall: '#2b2b2b' },
  { floor: '#8f9d76', ceil: '#a3b752', wall: '#3f8336' },
  { floor: '#8fa3bd', ceil: '#4f6985', wall: '#2f5f9a' },
  { floor: '#b79c82', ceil: '#6e5c4b', wall: '#7a4d2d' },
  { floor: '#a48fbd', ceil: '#66527e', wall: '#5b3d83' },
];

const modeHelp: Record<EditorMode, { title: string; text: string }> = {
  line: {
    title: '1. Линии',
    text: 'Кликните первую точку, затем вторую. Точки привязываются к сетке и переиспользуются при клике рядом.',
  },
  sector: {
    title: '2. Секторы',
    text: 'Кликайте по линиям по порядку обхода. Когда контур замкнется, сектор создастся автоматически.',
  },
  portal: {
    title: '3. Порталы',
    text: 'Кликните по общей линии двух секторов. Только такая линия может быть порталом.',
  },
  delete: {
    title: 'Удаление',
    text: 'Кликните по точке, линии или сектору. Линия удалит зависящие от нее секторы.',
  },
};

function distance(left: Vertex, right: Vertex) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function distanceToSegment(point: Vertex, start: Vertex, end: Vertex) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return distance(point, start);

  const t = Math.max(0, Math.min(1, (
    (point.x - start.x) * dx + (point.y - start.y) * dy
  ) / lengthSquared));

  return distance(point, {
    x: start.x + dx * t,
    y: start.y + dy * t,
  });
}

function polygonArea(points: Vertex[]) {
  return points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function pointInPolygon(point: Vertex, polygon: Vertex[]) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects = (
      (currentPoint.y > point.y) !== (previousPoint.y > point.y)
    ) && (
      point.x < (
        (previousPoint.x - currentPoint.x) *
        (point.y - currentPoint.y) /
        (previousPoint.y - currentPoint.y) +
        currentPoint.x
      )
    );

    if (intersects) inside = !inside;
  }

  return inside;
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Vertex[],
  fill: string,
  stroke: string,
) {
  if (points.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (const point of points.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  start: Vertex,
  end: Vertex,
  color: string,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length < 8) return;

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const arrowLength = Math.min(12, Math.max(7, length * 0.16));
  const arrowWidth = arrowLength * 0.55;
  const tip = {
    x: start.x + dx * 0.62,
    y: start.y + dy * 0.62,
  };
  const base = {
    x: tip.x - ux * arrowLength,
    y: tip.y - uy * arrowLength,
  };

  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(base.x + nx * arrowWidth, base.y + ny * arrowWidth);
  ctx.lineTo(base.x - nx * arrowWidth, base.y - ny * arrowWidth);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fill();
}

function Editor() {
  let canvasRef: HTMLCanvasElement | undefined;
  const [mode, setMode] = createSignal<EditorMode>('line');
  const [points, setPoints] = createSignal<EditorPoint[]>([]);
  const [lines, setLines] = createSignal<EditorLine[]>([]);
  const [sectors, setSectors] = createSignal<EditorSector[]>([]);
  const [portalLineIds, setPortalLineIds] = createSignal<Set<number>>(new Set());
  const [lineStartId, setLineStartId] = createSignal<number | null>(null);
  const [draftEdges, setDraftEdges] = createSignal<SectorEdge[]>([]);
  const [hoveredLineId, setHoveredLineId] = createSignal<number | null>(null);
  const [hoveredPointId, setHoveredPointId] = createSignal<number | null>(null);
  const [hoveredSectorId, setHoveredSectorId] = createSignal<number | null>(null);
  const [cursorPoint, setCursorPoint] = createSignal<Vertex | null>(null);
  const [message, setMessage] = createSignal(modeHelp.line.text);

  const pointById = createMemo(() => new Map(
    points().map((point) => [point.id, point]),
  ));

  const lineById = createMemo(() => new Map(
    lines().map((line) => [line.id, line]),
  ));

  const sectorLineUsage = createMemo(() => {
    const usage = new Map<number, number[]>();

    for (const sector of sectors()) {
      for (const edge of sector.edges) {
        const sectorIds = usage.get(edge.lineId) ?? [];
        sectorIds.push(sector.id);
        usage.set(edge.lineId, sectorIds);
      }
    }

    return usage;
  });

  const getLinePoints = (line: EditorLine) => {
    const start = pointById().get(line.startId)!;
    const end = pointById().get(line.endId)!;
    return { start, end };
  };

  const getEdgePoints = (edge: SectorEdge) => {
    const line = lineById().get(edge.lineId)!;
    const { start, end } = getLinePoints(line);
    return edge.reversed
      ? { start: end, end: start }
      : { start, end };
  };

  const getSectorPoints = (sector: EditorSector) =>
    sector.edges.map((edge) => getEdgePoints(edge).start);

  const draftClosed = createMemo(() => {
    const edges = draftEdges();
    if (edges.length < 3) return false;
    const first = getEdgePoints(edges[0]).start;
    const last = getEdgePoints(edges[edges.length - 1]).end;
    return first.id === last.id;
  });

  const levelJson = createMemo(() => {
    const serializableSectors = sectors().map((sector) => {
      const segs: SerializableSeg[] = sector.edges.map((edge) => {
        const { start, end } = getEdgePoints(edge);
        const portal = portalLineIds().has(edge.lineId);
        const usage = sectorLineUsage().get(edge.lineId) ?? [];
        const backSectorId = usage.find((id) => id !== sector.id);

        return {
          lineId: edge.lineId,
          start: { x: start.x, y: start.y },
          end: { x: end.x, y: end.y },
          isTwoSide: portal,
          frontSectorId: sector.id,
          ...(portal && backSectorId ? { backSectorId } : {}),
        };
      });

      return {
        id: sector.id,
        floorHeight: 0,
        floorColor: sector.floorColor,
        ceilHeight: 10_000,
        ceilColor: sector.ceilColor,
        wallColor: sector.wallColor,
        segs,
      };
    });

    return {
      linedefs: lines().map((line) => {
        const { start, end } = getLinePoints(line);
        const usage = sectorLineUsage().get(line.id) ?? [];

        return {
          id: line.id,
          start: { x: start.x, y: start.y },
          end: { x: end.x, y: end.y },
          isTwoSide: portalLineIds().has(line.id),
          sectorIds: usage,
        };
      }),
      sectors: serializableSectors,
    };
  });

  const levelJsonText = createMemo(() =>
    JSON.stringify(levelJson(), null, 2),
  );

  const canvasToWorld = (event: PointerEvent): Vertex => {
    const rect = canvasRef!.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const snapPoint = (rawPoint: Vertex): EditorPoint => {
    const existing = points().find(
      (point) => distance(point, rawPoint) <= SNAP_RADIUS,
    );

    if (existing) return existing;

    return {
      id: -1,
      x: Math.round(rawPoint.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(rawPoint.y / GRID_SIZE) * GRID_SIZE,
    };
  };

  const upsertPoint = (point: EditorPoint) => {
    if (point.id !== -1) return point.id;

    const duplicate = points().find(
      (existing) => existing.x === point.x && existing.y === point.y,
    );

    if (duplicate) return duplicate.id;

    const nextId = points().reduce((max, item) => Math.max(max, item.id), 0) + 1;
    setPoints((items) => [...items, { ...point, id: nextId }]);
    return nextId;
  };

  const findLineAt = (point: Vertex) => {
    let bestLine: EditorLine | null = null;
    let bestDistance = Infinity;

    for (const line of lines()) {
      const { start, end } = getLinePoints(line);
      const hitDistance = distanceToSegment(point, start, end);

      if (hitDistance < bestDistance) {
        bestDistance = hitDistance;
        bestLine = line;
      }
    }

    return bestLine && bestDistance <= LINE_PICK_RADIUS ? bestLine : null;
  };

  const findPointAt = (point: Vertex) =>
    points().find((candidate) => distance(candidate, point) <= SNAP_RADIUS) ?? null;

  const findSectorAt = (point: Vertex) =>
    [...sectors()]
      .reverse()
      .find((sector) => pointInPolygon(point, getSectorPoints(sector))) ?? null;

  const getPortalIdsForSectors = (
    nextSectors: EditorSector[],
    currentPortalIds = portalLineIds(),
  ) => {
    const usage = new Map<number, number>();

    for (const sector of nextSectors) {
      for (const edge of sector.edges) {
        usage.set(edge.lineId, (usage.get(edge.lineId) ?? 0) + 1);
      }
    }

    return new Set(
      [...currentPortalIds].filter((lineId) => usage.get(lineId) === 2),
    );
  };

  const removeSector = (sector: EditorSector) => {
    const nextSectors = sectors().filter((item) => item.id !== sector.id);
    setSectors(nextSectors);
    setPortalLineIds(getPortalIdsForSectors(nextSectors));
    setDraftEdges([]);
    setMessage(`Сектор ${sector.id} удален.`);
  };

  const removeLine = (line: EditorLine) => {
    const removedSectorIds = sectors()
      .filter((sector) => sector.edges.some((edge) => edge.lineId === line.id))
      .map((sector) => sector.id);
    const nextSectors = sectors().filter((sector) =>
      !sector.edges.some((edge) => edge.lineId === line.id),
    );
    const nextLines = lines().filter((item) => item.id !== line.id);
    const usedPointIds = new Set(
      nextLines.flatMap((item) => [item.startId, item.endId]),
    );

    setLines(nextLines);
    setPoints((items) => items.filter((point) => usedPointIds.has(point.id)));
    setSectors(nextSectors);
    setPortalLineIds(getPortalIdsForSectors(nextSectors));
    setDraftEdges((edges) => edges.filter((edge) => edge.lineId !== line.id));
    setLineStartId(null);
    setMessage(
      removedSectorIds.length > 0
        ? `Линия ${line.id} удалена. Также удалены секторы: ${removedSectorIds.join(', ')}.`
        : `Линия ${line.id} удалена.`,
    );
  };

  const removePoint = (point: EditorPoint) => {
    const used = lines().some((line) =>
      line.startId === point.id || line.endId === point.id,
    );

    if (used) {
      setMessage('Нельзя удалить точку, пока к ней привязаны линии.');
      return;
    }

    setPoints((items) => items.filter((item) => item.id !== point.id));
    setMessage(`Точка ${point.id} удалена.`);
  };

  const handleDeleteClick = (point: Vertex) => {
    const hitPoint = findPointAt(point);
    if (hitPoint) {
      removePoint(hitPoint);
      return;
    }

    const hitLine = findLineAt(point);
    if (hitLine) {
      removeLine(hitLine);
      return;
    }

    const hitSector = findSectorAt(point);
    if (hitSector) {
      removeSector(hitSector);
      return;
    }

    setMessage('Нечего удалить в этой точке.');
  };

  const createLine = (startId: number, endId: number) => {
    if (startId === endId) {
      setMessage('Линия должна соединять две разные точки.');
      return;
    }

    const exists = lines().some((line) =>
      (line.startId === startId && line.endId === endId) ||
      (line.startId === endId && line.endId === startId),
    );

    if (exists) {
      setMessage('Такая линия уже существует.');
      return;
    }

    const nextId = lines().reduce((max, line) => Math.max(max, line.id), 0) + 1;
    setLines((items) => [...items, { id: nextId, startId, endId }]);
    setMessage(`Линия ${nextId} создана.`);
  };

  const handleLineClick = (point: Vertex) => {
    const snapped = snapPoint(point);
    const pointId = upsertPoint(snapped);

    if (lineStartId() === null) {
      setLineStartId(pointId);
      setMessage('Выберите вторую точку линии.');
      return;
    }

    createLine(lineStartId()!, pointId);
    setLineStartId(null);
  };

  const handleSectorLineClick = (line: EditorLine) => {
    const edges = draftEdges();

    if (edges.some((edge) => edge.lineId === line.id)) {
      setMessage('Эта линия уже есть в текущем секторе.');
      return;
    }

    if (edges.length === 0) {
      setDraftEdges([{ lineId: line.id, reversed: false }]);
      setMessage('Добавляйте соседние линии по порядку обхода сектора.');
      return;
    }

    let nextEdges = edges;
    let lastEnd = getEdgePoints(nextEdges[nextEdges.length - 1]).end;
    let reversed = line.endId === lastEnd.id;

    if (line.startId !== lastEnd.id && !reversed && nextEdges.length === 1) {
      const flippedFirstEdge = {
        ...nextEdges[0],
        reversed: !nextEdges[0].reversed,
      };
      const flippedLastEnd = getEdgePoints(flippedFirstEdge).end;
      const canConnectAfterFlip =
        line.startId === flippedLastEnd.id || line.endId === flippedLastEnd.id;

      if (canConnectAfterFlip) {
        nextEdges = [flippedFirstEdge];
        lastEnd = flippedLastEnd;
        reversed = line.endId === lastEnd.id;
      }
    }

    if (line.startId !== lastEnd.id && !reversed) {
      setMessage('Следующая линия должна начинаться в конце предыдущей.');
      return;
    }

    const updatedEdges = [...nextEdges, { lineId: line.id, reversed }];
    setDraftEdges(updatedEdges);

    const first = getEdgePoints(updatedEdges[0]).start;
    const last = getEdgePoints(updatedEdges[updatedEdges.length - 1]).end;

    if (updatedEdges.length >= 3 && first.id === last.id) {
      createSectorFromEdges(updatedEdges);
      return;
    }

    setMessage(`Линия добавлена в сектор. Выбрано: ${updatedEdges.length}.`);
  };

  const createSectorFromEdges = (edges: SectorEdge[]) => {
    if (edges.length < 3) {
      setMessage('Сектор должен быть замкнут минимум тремя линиями.');
      return;
    }

    const pointsForArea = edges.map((edge) => getEdgePoints(edge).start);
    const normalizedEdges = polygonArea(pointsForArea) < 0
      ? [...edges].reverse().map((edge) => ({
        lineId: edge.lineId,
        reversed: !edge.reversed,
      }))
      : edges;
    const nextId = sectors().reduce((max, sector) => Math.max(max, sector.id), 0) + 1;
    const colors = SECTOR_COLORS[(nextId - 1) % SECTOR_COLORS.length];

    setSectors((items) => [
      ...items,
      {
        id: nextId,
        edges: normalizedEdges,
        floorColor: colors.floor,
        ceilColor: colors.ceil,
        wallColor: colors.wall,
      },
    ]);
    setDraftEdges([]);
    setMessage(`Сектор ${nextId} создан.`);

    queueMicrotask(markSharedLinesAsPortals);
  };

  const createSector = () => {
    if (!draftClosed()) {
      setMessage('Сектор должен быть замкнут минимум тремя линиями.');
      return;
    }

    createSectorFromEdges(draftEdges());
  };

  const markSharedLinesAsPortals = () => {
    const sharedIds = [...sectorLineUsage().entries()]
      .filter(([, usage]) => usage.length === 2)
      .map(([lineId]) => lineId);

    setPortalLineIds((ids) => new Set([...ids, ...sharedIds]));
  };

  const togglePortal = (line: EditorLine) => {
    const usage = sectorLineUsage().get(line.id) ?? [];

    if (usage.length !== 2) {
      setMessage('Порталом может быть только общая линия двух секторов.');
      return;
    }

    setPortalLineIds((ids) => {
      const next = new Set(ids);
      if (next.has(line.id)) {
        next.delete(line.id);
        setMessage(`Линия ${line.id} больше не портал.`);
      } else {
        next.add(line.id);
        setMessage(`Линия ${line.id} отмечена как портал.`);
      }
      return next;
    });
  };

  const handlePointerDown = (event: PointerEvent) => {
    const point = canvasToWorld(event);
    const hitLine = findLineAt(point);

    if (mode() === 'delete') {
      handleDeleteClick(point);
      return;
    }

    if (mode() === 'line') {
      handleLineClick(point);
      return;
    }

    if (!hitLine) {
      setMessage('Выберите линию.');
      return;
    }

    if (mode() === 'sector') {
      handleSectorLineClick(hitLine);
    } else {
      togglePortal(hitLine);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const point = canvasToWorld(event);
    const hitPoint = findPointAt(point);
    const hitLine = findLineAt(point);
    setCursorPoint(snapPoint(point));
    setHoveredPointId(hitPoint?.id ?? null);
    setHoveredLineId(hitLine?.id ?? null);
    setHoveredSectorId(hitPoint || hitLine ? null : findSectorAt(point)?.id ?? null);
  };

  const handleModeChange = (nextMode: EditorMode) => {
    setMode(nextMode);
    setLineStartId(null);
    setHoveredLineId(null);
    setHoveredPointId(null);
    setHoveredSectorId(null);
    if (nextMode !== 'sector') setDraftEdges([]);

    if (nextMode === 'line') setMessage('Кликайте по сетке, чтобы создавать линии.');
    if (nextMode === 'sector') setMessage('Кликайте по линиям по порядку обхода сектора.');
    if (nextMode === 'portal') setMessage('Кликайте по общим линиям двух секторов, чтобы переключать портал.');
    if (nextMode === 'delete') setMessage('Кликните по точке, линии или сектору для удаления.');
  };

  const cancelDraft = () => {
    setDraftEdges([]);
    setMessage('Выбор линий сектора сброшен.');
  };

  const resetAll = () => {
    setPoints([]);
    setLines([]);
    setSectors([]);
    setPortalLineIds(new Set());
    setDraftEdges([]);
    setLineStartId(null);
    setMessage('Редактор очищен.');
  };

  const loadExample = () => {
    setPoints([
      { id: 1, x: 120, y: 140 },
      { id: 2, x: 320, y: 140 },
      { id: 3, x: 320, y: 320 },
      { id: 4, x: 120, y: 320 },
      { id: 5, x: 500, y: 140 },
      { id: 6, x: 500, y: 320 },
    ]);
    setLines([
      { id: 1, startId: 1, endId: 2 },
      { id: 2, startId: 2, endId: 3 },
      { id: 3, startId: 3, endId: 4 },
      { id: 4, startId: 4, endId: 1 },
      { id: 5, startId: 2, endId: 5 },
      { id: 6, startId: 5, endId: 6 },
      { id: 7, startId: 6, endId: 3 },
    ]);
    setSectors([]);
    setPortalLineIds(new Set());
    setDraftEdges([]);
    setLineStartId(null);
    setMode('sector');
    setMessage('Пример загружен. Соберите левый и правый прямоугольники в два сектора.');
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(levelJsonText());
    setMessage('JSON скопирован.');
  };

  createEffect(() => {
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();

    for (const sector of sectors()) {
      const deleting = mode() === 'delete' && hoveredSectorId() === sector.id;
      drawPolygon(
        ctx,
        getSectorPoints(sector),
        deleting ? 'rgba(220, 38, 38, 0.18)' : `${sector.floorColor}66`,
        deleting ? '#dc2626' : sector.wallColor,
      );
    }

    if (draftEdges().length > 0) {
      const draftPoints = draftEdges().map((edge) => getEdgePoints(edge).start);
      const last = getEdgePoints(draftEdges()[draftEdges().length - 1]).end;
      ctx.save();
      ctx.strokeStyle = draftClosed() ? '#16a34a' : '#2563eb';
      ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.moveTo(draftPoints[0].x, draftPoints[0].y);
      for (const point of draftPoints.slice(1)) ctx.lineTo(point.x, point.y);
      ctx.lineTo(last.x, last.y);
      if (draftClosed()) ctx.closePath();
      if (draftClosed()) ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    for (const line of lines()) {
      const { start, end } = getLinePoints(line);
      const portal = portalLineIds().has(line.id);
      const deleting = mode() === 'delete' && hoveredLineId() === line.id;
      const selected = hoveredLineId() === line.id ||
        draftEdges().some((edge) => edge.lineId === line.id);

      ctx.save();
      ctx.strokeStyle = deleting ? '#dc2626' : portal ? '#dc2626' : selected ? '#2563eb' : '#111827';
      ctx.lineWidth = deleting ? 6 : portal ? 5 : selected ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      drawArrow(ctx, start, end, portal ? '#dc2626' : '#111827');
      ctx.restore();

      const midpoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
      };
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(line.id), midpoint.x + 4, midpoint.y - 4);
    }

    for (const point of points()) {
      const deleting = mode() === 'delete' && hoveredPointId() === point.id;
      ctx.beginPath();
      ctx.arc(point.x, point.y, deleting || lineStartId() === point.id ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = deleting ? '#dc2626' : lineStartId() === point.id ? '#2563eb' : '#111827';
      ctx.fill();
    }

    if (mode() === 'line' && cursorPoint()) {
      const cursor = cursorPoint()!;
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = '#2563eb';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
      ctx.stroke();

      if (lineStartId() !== null) {
        const start = pointById().get(lineStartId()!)!;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  });

  return (
    <div class="grid gap-4 lg:grid-cols-[minmax(0,680px)_minmax(300px,1fr)]">
      <div class="flex min-w-0 flex-col gap-3">
        <div class="grid gap-2 sm:grid-cols-4">
          <For each={(['line', 'sector', 'portal', 'delete'] as EditorMode[])}>
            {(tool) => (
              <button
                type="button"
                class={`border p-3 text-left transition-colors ${
                  mode() === tool
                    ? 'border-[#9eb3da] bg-[#dce6fa] text-[#1f2a44]'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleModeChange(tool)}
              >
                <span class="block text-sm font-semibold">{modeHelp[tool].title}</span>
                <span class="mt-1 block text-xs leading-snug">{modeHelp[tool].text}</span>
              </button>
            )}
          </For>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class={`border px-3 py-2 text-sm font-medium ${
              draftClosed()
                ? 'border-[#9eb3da] bg-[#dce6fa] text-[#1f2a44] hover:bg-[#c8d8f5]'
                : 'border-gray-200 bg-gray-100 text-gray-400'
            }`}
            disabled={!draftClosed()}
            onClick={createSector}
          >
            Создать сектор
          </button>
          <button
            type="button"
            class={`border px-3 py-2 text-sm font-medium ${
              draftEdges().length > 0
                ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                : 'border-gray-200 bg-gray-100 text-gray-400'
            }`}
            disabled={draftEdges().length === 0}
            onClick={cancelDraft}
          >
            Отменить контур
          </button>
          <button
            type="button"
            class="border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={markSharedLinesAsPortals}
          >
            Общие линии в порталы
          </button>
          <button
            type="button"
            class="border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={loadExample}
          >
            Загрузить пример
          </button>
          <button
            type="button"
            class="border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={resetAll}
          >
            Очистить
          </button>
        </div>
        <div class="border border-[#d8deea] bg-white p-3 text-sm text-[#4a5a75]">
          <div class="font-semibold text-[#1f2a44]">{modeHelp[mode()].title}</div>
          <div class="mt-1">{message()}</div>
          {mode() === 'line' && lineStartId() !== null && (
            <div class="mt-2 text-[#2563eb]">
              Первая точка выбрана. Кликните вторую точку или переключите режим для отмены.
            </div>
          )}
          {mode() === 'sector' && draftEdges().length > 0 && (
            <div class="mt-2 text-[#2563eb]">
              В контуре выбрано линий: {draftEdges().length}. Замкните контур, чтобы сектор создался автоматически.
            </div>
          )}
        </div>
        <canvas
          ref={(element) => {
            canvasRef = element;
          }}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          class="block max-w-full border border-gray-300 bg-white"
          style={{ cursor: mode() === 'delete' ? 'pointer' : 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            setCursorPoint(null);
            setHoveredLineId(null);
            setHoveredPointId(null);
            setHoveredSectorId(null);
          }}
        />
        <div class="min-h-6 text-sm text-[#4a5a75]">
          Точки привязаны к сетке {GRID_SIZE}px. Наведенная линия подсвечивается синим, портал — красным.
        </div>
        <div class="grid gap-2 text-sm text-[#4a5a75] sm:grid-cols-3">
          <div>Линий: {lines().length}</div>
          <div>Секторов: {sectors().length}</div>
          <div>Порталов: {portalLineIds().size}</div>
        </div>
        <div class="text-sm text-[#4a5a75]">
          <p>Для быстрого старта нажмите «Загрузить пример», затем в режиме «Секторы» кликните линии левого прямоугольника по порядку, после этого линии правого прямоугольника. Общая линия автоматически станет порталом.</p>
        </div>
      </div>

      <div class="flex min-w-0 flex-col gap-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-[#1f2a44]">Level JSON</h2>
          <button
            type="button"
            class="border border-[#9eb3da] bg-[#dce6fa] px-3 py-2 text-sm font-medium text-[#1f2a44] hover:bg-[#c8d8f5]"
            onClick={copyJson}
          >
            Скопировать
          </button>
        </div>
        <pre class="max-h-[620px] overflow-auto border border-gray-300 bg-[#0d1117] p-3 text-xs leading-relaxed text-[#c9d1d9]"><code>{levelJsonText()}</code></pre>
        <div class="border border-[#d8deea] bg-white p-3 text-sm text-[#4a5a75]">
          <p class="font-semibold text-[#1f2a44]">Секторы</p>
          <For each={sectors()}>
            {(sector) => (
              <div class="mt-2 flex items-center gap-2">
                <span
                  class="inline-block h-3 w-3 border border-gray-400"
                  style={{ 'background-color': sector.floorColor }}
                />
                <span>Sector {sector.id}: {sector.edges.length} линий</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default Editor;
