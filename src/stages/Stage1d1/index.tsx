import Canvas from "@app/Canvas/CanvasBase";
import CodeBlock from "@app/components/Code";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d from './render25d';
import defaultSettings from './settings';


const code1 = `
  function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;

    for (const linedef of settings.level.linedefs) {
      const projection = projectLinedef(camera, linedef);

      if (!projection) {
        continue;
      }
      
      drawPolygon(ctx, projectionToPoints(camera, projection));
    }
  }

`;

const code2 = `
  interface IntersectionAngles {
    linedefFrom: number;
    linedefTo: number;
    cameraFrom: number;
    cameraTo: number;
  }

  function calculateIntersectionAngles(linedef: Linedef, camera: Camera): null | IntersectionAngles {
    // ..
  }

`;

const code3 = `
  function projectLinedef(camera: Camera, linedef: Linedef) : LinedefProjection | null {
    const angles = calculateIntersectionAngles(linedef, camera);

    if (angles === null) {
      return null;
    }

    const relativeAngleStart = new Angle(angles.linedefFrom - camera.angle.degrees);

    const distanceStart = toDistance(linedef.start, camera) * Math.abs(relativeAngleStart.cos);
    const distanceEnd = toDistance(linedef.end, camera) * Math.abs(relativeAngleEnd.cos);

    const heightStart = WALL_HEIGHT / distanceStart;
    const heightEnd = WALL_HEIGHT / distanceEnd;

    const isLinedefStartHeigher = heightStart > heightEnd;
    const linedefMinHeight = Math.min(heightStart, heightEnd);
    const linedefDiffHeight = Math.abs(heightStart - heightEnd);
    const linedefAngleRange = angles.linedefTo - angles.linedefFrom;

    let start;

    if (angles.linedefFrom < angles.cameraFrom) {
      const percent = (angles.cameraFrom - angles.linedefFrom) / linedefAngleRange;
      const k = isLinedefStartHeigher ? (1 - percent) : percent;

      start = {
        screenX: 0,
        height: linedefMinHeight + linedefDiffHeight * k
      }
    } else {
      start = {
        screenX: toScreenX('linedefFrom', angles, camera),
        height: heightStart
      }
    }

    // ..

`;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      <p class="py-2 text">
        До этого мы воспринимали мир как набор спроецированных вершин, и если хотя бы одна вершина не попадала в область видимости, то мы полностью исключали линию, которая из этих вершин и состояла. Теперь необходимо перейти к тому пониманию, что мир это множество спроецированных линий:
      </p>

      <CodeBlock code={code1} lang="ts" />

      <p class="py-2 text">
        Теперь поставим задачу иначе. Если хотя бы одна из вершин находится в области видимости, то необходимо найти пересечение линии с областью видимости.
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 justify-items md:grid md:grid-cols-2 md:gap-4 md:items-start">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={render25d}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              withControls
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>
      <h2 class="text-2xl">Немного кода</h2>
      <p class="py-2 text">
        Добавим несколько вспомогательных функций, основная из которых позволяет получить значения в полярных координатах, а именно нормализованное значение углов для области видимости и для спроецированной линии:
      </p>
      <CodeBlock code={code2} lang="ts" />
      <p class="py-2 text"> 
        Затем мы можем расчитать процент видимой части диапазона углов для проекции относительно всего диапазона и использовать этот процент для вычисления высоты в точке месте пересечения. Линейная интерполяция.
      </p>
      <CodeBlock code={code3} lang="ts" />
      <p class="my-2">
        <RepoLink filePath="stages/Stage1d1/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
