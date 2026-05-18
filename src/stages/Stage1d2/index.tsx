import Canvas from "@app/Canvas/CanvasBase";
import CodeBlock from "@app/components/Code";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dStage1d1 from '../Stage1d1/render25d';
import render25dStage1d2 from './render25d';
import defaultSettings from './settings';

const code = `
  function caclulateScaleFactor(
    screenX: number,
    linedef: Linedef,
    camera: Camera
  ): number {
    const screenXAngle = angleFromScreenX(screenX, camera);

    const wallDir = toAngle(linedef.end, linedef.start);
    const wallNormal = new Angle(wallDir.degrees + 90);

    const viewAngle = camera.angle.degrees + screenXAngle.degrees;
    const skewAngle = new Angle(viewAngle - wallNormal.degrees);
    const skewAngleCos = Math.abs(skewAngle.cos);

    const screenXAngleCos = Math.abs(screenXAngle.cos);
    
    return skewAngleCos) / screenXAngleCos;
  }

`;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <p class="text">TODO</p>

      <div class="grid grid-cols-1 gap-4 md:grid md:grid-cols-3 md:gap-6 md:items-start ">
        <div>
          <h4 class="flex justify-center text-xl mb-2">Polar coords + linear interpolation</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={render25dStage1d1}
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
          <h4 class="flex justify-center text-xl mb-2">Scale factor</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={render25dStage1d2}
          />
        </div>
      </div>

      <h2 class="text-2xl">Как это рассчитать</h2>

      <p class="text">Коэффициент, во сколько раз нужно изменить базовую высоту из-за угла обзора стены, нормализованный по fish-eye искажению.</p>

      <CodeBlock code={code} lang="ts" />

      <p class="my-2">
        <RepoLink filePath="stages/Stage1d2/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
