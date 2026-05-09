import { Angle } from "@app/lib/Angle";
import { drawCircle, drawLinedef } from "@app/lib/canvas";

const VERTEX_DOT_SIZE = 3;
const CAMERA_DOT_SIZE = 5;

function scaleLinedef(linedef: Linedef, scale: number, offsetX: number, offsetY: number) {
  return {
    start: {
      x: linedef.start.x * scale + offsetX,
      y: linedef.start.y * scale + offsetY
    },
    end: {
      x: linedef.end.x * scale + offsetX,
      y: linedef.end.y * scale + offsetY
    },
  } 
}

function getIntersectionWithCanvasEdges(
  fromX: number,
  fromY: number,
  angle: Angle,
  canvasWidth: number,
  canvasHeight: number
): { x: number, y: number } {
  const dirX = angle.cos;
  const dirY = angle.sin;
  
  const intersections: { x: number, y: number, t: number }[] = [];
  
  if (dirX > 0) {
    const t = (canvasWidth - fromX) / dirX;
    if (t > 0) {
      const y = fromY + t * dirY;
      if (y >= 0 && y <= canvasHeight) {
        intersections.push({ x: canvasWidth, y, t });
      }
    }
  } else if (dirX < 0) {
    const t = (0 - fromX) / dirX;
    if (t > 0) {
      const y = fromY + t * dirY;
      if (y >= 0 && y <= canvasHeight) {
        intersections.push({ x: 0, y, t });
      }
    }
  }
  
  if (dirY > 0) {
    const t = (canvasHeight - fromY) / dirY;
    if (t > 0) {
      const x = fromX + t * dirX;
      if (x >= 0 && x <= canvasWidth) {
        intersections.push({ x, y: canvasHeight, t });
      }
    }
  } else if (dirY < 0) {
    const t = (0 - fromY) / dirY;
    if (t > 0) {
      const x = fromX + t * dirX;
      if (x >= 0 && x <= canvasWidth) {
        intersections.push({ x, y: 0, t });
      }
    }
  }
  
  if (intersections.length === 0) {
    const maxDim = Math.max(canvasWidth, canvasHeight) * 2;
    return {
      x: fromX + dirX * maxDim,
      y: fromY + dirY * maxDim
    };
  }
  
  const closest = intersections.reduce((min, curr) => curr.t < min.t ? curr : min);
  
  return {
    x: closest.x,
    y: closest.y
  };
}

function drawLine(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

export default function render2d(
  ctx: CanvasRenderingContext2D, 
  settings: Settings,
  scale: number = 1,
  offsetX: number = 0,
  offsetY: number = 0
) {
  const camera = settings.camera;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  for (const linedef of settings.level.linedefs) {
    drawLinedef(ctx, scaleLinedef(linedef, scale, offsetX, offsetY));
    drawCircle(
      ctx, 
      linedef.start.x * scale + offsetX,
      linedef.start.y * scale + offsetY,
      VERTEX_DOT_SIZE * scale,
    );
    drawCircle(
      ctx, 
      linedef.end.x * scale + offsetX,
      linedef.end.y * scale + offsetY,
      VERTEX_DOT_SIZE * scale,
    );
  }

  const cameraScreenX = camera.x * scale + offsetX;
  const cameraScreenY = camera.y * scale + offsetY;
  
  const leftAngle = new Angle(camera.angle.degrees - camera.fov.degrees / 2);
  const centerAngle = camera.angle;
  const rightAngle = new Angle(camera.angle.degrees + camera.fov.degrees / 2);
  
  const leftRayEnd = getIntersectionWithCanvasEdges(
    cameraScreenX, 
    cameraScreenY, 
    leftAngle, 
    canvasWidth, 
    canvasHeight
  );
  
  const centerRayEnd = getIntersectionWithCanvasEdges(
    cameraScreenX, 
    cameraScreenY, 
    centerAngle, 
    canvasWidth, 
    canvasHeight
  );
  
  const rightRayEnd = getIntersectionWithCanvasEdges(
    cameraScreenX, 
    cameraScreenY, 
    rightAngle, 
    canvasWidth, 
    canvasHeight
  );
  
  ctx.save();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  drawLine(ctx, cameraScreenX, cameraScreenY, leftRayEnd.x, leftRayEnd.y);
  drawLine(ctx, cameraScreenX, cameraScreenY, centerRayEnd.x, centerRayEnd.y);
  drawLine(ctx, cameraScreenX, cameraScreenY, rightRayEnd.x, rightRayEnd.y);
  
  ctx.restore();
  drawCircle(
    ctx, 
    cameraScreenX,
    cameraScreenY,
    CAMERA_DOT_SIZE * scale,
    'red'
  );
}