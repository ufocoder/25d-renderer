import Canvas from "@app/Canvas/CanvasBase";
import CodeBlock from "@app/components/Code";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { createRender25d } from '../Stage1c/render25d';
import render25d from './render25d';
import defaultSettings from './settings';


const code = `
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

      <p class="text">TODO</p>

      <div class="grid grid-cols-1 gap-4 md:grid md:grid-cols-3 md:gap-6 md:items-start ">
        <div>
          <h4 class="flex justify-center text-xl mb-2">Пропуск стен</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={createRender25d({ withFix: true })}
          />
        </div>
         <div>
          <h4 class="flex justify-center text-xl mb-2">Вид сверху</h4>
          <Map2d
            withControls
            canvasClassName='w-full'
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            settings={settings}
            render={render2d} />
        </div>
        <div>
          <h4 class="flex justify-center text-xl mb-2">Полярые координаты и инейная интерполяция</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={render25d}
          />
        </div>
      </div>

      <h2 class="text-2xl">Как это рассчитать</h2>

      <p class="text">TODO</p>

      <CodeBlock code={code} lang="ts" />

      <p class="my-2">
        <RepoLink filePath="stages/Stage1d1/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
