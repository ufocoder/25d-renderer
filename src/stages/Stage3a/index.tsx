import Canvas from "@app/Canvas/CanvasBase";
import { useCameraControls } from "@app/hooks/useCameraControls";
import render2dStage0 from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2dStage2j from '../Stage2j/render25d';

import Map2d from "@app/components/Map2d";
import defaultSettings1 from './settings';
import defaultSettings2 from './settings2';

const Stage: Component = () => {
  const [settings1, setSettings1] = createSignal<Settings>(defaultSettings1);
  const [settings2, setSettings2] = createSignal<Settings>(defaultSettings2);

  useCameraControls<Settings>({ settings: settings1, setSettings: setSettings1 });
  useCameraControls<Settings>({ settings: settings2, setSettings: setSettings2 });

  return (
    <section class="flex flex-col gap-4">

      <p class="py-2 text">
        Отрисуем внутренний сектор с портальными сегментами
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings1}
              width={settings1().camera.screen.width}
              height={settings1().camera.screen.height}
              render={render2dStage2j} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              initialZoom={0.6}
              initialOffsetX={75}
              initialOffsetY={50}
              withControls
              width={400}
              height={320}
              settings={settings1}
              render={render2dStage0} />
          </div>
        </div>
      </div>
  
      <p class="py-2 text">
        Отрисуем внутренний сектор с обычными сегментами
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings2}
              width={settings2().camera.screen.width}
              height={settings2().camera.screen.height}
              render={render2dStage2j} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              initialZoom={0.6}
              initialOffsetX={75}
              initialOffsetY={50}
              withControls
              width={400}
              height={320}
              settings={settings2}
              render={render2dStage0} />
          </div>
        </div>
      </div>

      <p class="py-2 text">
        Очевидно, текущий отрисовщик с этим не справляется
      </p>
     
    </section>
  );
};

export default Stage;