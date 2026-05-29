import Canvas from "@app/Canvas/CanvasBase";
import CodeBlock from "@app/components/Code";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dStage1d1 from '../Stage1d1/render25d';
import render25dStage1d2 from './render25d';
import defaultSettings from './settings';
import Label from "@app/components/Label";

const code1 = `
    function caclulateScaleFactor(
      screenX: number,
      linedef: Linedef,
      camera: Camera
    ): number {
      const distance = distanceToLinedef(linedef, camera);
      const screenXAngle = angleFromScreenX(screenX, camera);
    
      const wallDir = toAngle(linedef.end, linedef.start);
      const wallNormal = new Angle(wallDir.degrees + 90);
    
      const viewAngle = camera.angle.degrees + screenXAngle.degrees;
      const skewAngle = new Angle(viewAngle - wallNormal.degrees);
      const skewAngleCos = Math.abs(skewAngle.cos);
    
      const screenXAngleCos = Math.abs(screenXAngle.cos);
      
      return (distance * skewAngleCos) / (distance * screenXAngleCos);
    }

`;

const code2 = `
  function projectLinedef(camera: Camera, linedef: Linedef) : LinedefProjection | null {
    const angles = calculateIntersectionAngles(linedef, camera);

    if (angles === null) {
      return null;
    }

    const distanceToCamera = distanceToLinedef(linedef, camera)

    const startScreenX = angles.linedefFrom < angles.cameraFrom 
      ? 0 
      : toScreenX(angles.linedefFrom, angles, camera);
      
    const endScreenX = angles.linedefTo > angles.cameraTo
      ? camera.screen.width 
      : toScreenX(angles.linedefTo, angles, camera);

    const startScale = caclulateScaleFactor(startScreenX, linedef, camera);
    const endScale = caclulateScaleFactor(endScreenX, linedef, camera);

    return {
      start: {
        screenX: startScreenX,
        height: WALL_HEIGHT * startScale / distanceToCamera
      },
      end: {
        screenX: endScreenX,
        height: WALL_HEIGHT * endScale / distanceToCamera
      }
    };
  }

`;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <p class="py-text">
        В прошлом примере стены были расположены так, что всегда были повернуты лицом к камере. Но нам необходимо также учитывать угол между стеной и направлением взгляда, чтобы создать правильное перспективное искажение. Поэтому мы введем специальный коэффициент, <Label>scale factor</Label>, учитывающий ориентацию стены относительно луча зрения.
      </p>

      <div class="my-10 grid grid-cols-1 gap-4 md:grid md:grid-cols-3 md:gap-6 md:items-start ">
        <div>
          <h4 class="flex justify-center text-xl mb-2">2.5D Renderer (not fixed)</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={render25dStage1d1}
          />
        </div>
         <div>
          <h4 class="flex justify-center text-xl mb-2">2D Renderer</h4>
          <Map2d
            withControls
            canvasClassName='w-full'
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            settings={settings}
            render={render2d} />
        </div>
        <div>
          <h4 class="flex justify-center text-xl mb-2">2.5D Renderer (fixed)</h4>
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

      <p class="py-2 text">Коэффициент, во сколько раз нужно изменить базовую высоту из-за угла обзора стены:</p>

      <CodeBlock code={code1} lang="ts" />

      <p class="py-2 text">Обномиф функцию расчета проекции</p>

      <CodeBlock code={code2} lang="ts" />

      <p class="my-2">
        <RepoLink filePath="stages/Stage1d2/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
