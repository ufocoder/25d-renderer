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
        Мы воспринимали мир как набор спроецированных вершин, и если хотя бы одна вершина не попадала в область видимости, то мы полностью исключали отрезок из отрисовки. Нам необходимо перейти к тому пониманию, что мир это множество спроецированных отрезков.
      </p>
      <CodeBlock code={code1} lang="ts" />
      <p class="py-2 text">
        Теперь поставим задачу по другому: <span class="font-semibold">необходимо отрисовывать только то, что попадает в область видимости.</span>
      </p>  

      <p class="py-2 text">
        Может быть несколько вариантов того, как отрезок связан с областью видимости:
      </p>

      <ul class="list-inside list-disc">
        <li>Отрезок полностью попадает в область видимости</li>
        <li>Отрезок не полностью попадает в область видимости</li>
        <li>Отрезок пересекает область видимости по левому или правому краю</li>
        <li>Отрезок пересекает область видимости по левому и правому краю</li>
      </ul>

      <p class="py-2 text">
        Как идея, перейдем к полярным координатам и будем рассматривать область видимости и отрезок как диапазоны значений в полярных координатах, то есть как диапазоны углов. Это позволит нам учесть все вышеописанные ситуации. Здесь мы можем определить функцию, которая возвращает те самые диапазоны углов, если отрезок попадает в область видимости.
      </p>
      <p class="py-2 text">
        К сожалению, у меня получилась большая реализация, поэтому для изучения функции обратитесь к <a  class="link underline" href="https://github.com/ufocoder/25d-renderer/blob/main/src/stages/Stage1d1/render25d.ts#L42" target="_blank">ее исходному коду</a>
      </p>

      <p class="py-2 text">
        Если отрезок пересекает край области видимости, то используем диапазоны углов и рассчитываем какую часть диапазона углов для отрезка занимает точка пересечения с областью видимости. Получаем коэффициент от 0 до 1. Этот коэффициент мы будем использовать, чтобы домножать высоту отрезка. Как именно смотри код ниже или читай исходных код шага.
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
        Добавим несколько вспомогательных функций, основная из которых позволяет получить значения в полярных координатах, а именно нормализованное значение углов для области видимости и для спроецированного отрезка:
      </p>
      <CodeBlock code={code2} lang="ts" />
      <p class="py-2 text"> 
        Расчитаем процент видимой части диапазона углов для проекции относительно всего диапазона и использовать этот процент для вычисления высоты в точке месте пересечения:
      </p>
      <CodeBlock code={code3} lang="ts" />
      <p class="my-2">
        <RepoLink filePath="stages/Stage1d1/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
