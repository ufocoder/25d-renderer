import Canvas from "@app/Canvas/CanvasBase";
import { useCameraControls } from "@app/hooks/useCameraControls";
import render2dStage0 from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2dStage2j from '../Stage2j/render25d';
import defaultSettings from './settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      
      <p>TODO</p>


      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              width={400}
              height={400}
              settings={settings}
              render={render2dStage0} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
             <Canvas
              width={400}
              height={400}
              settings={settings}
              render={render2dStage2j} />
          </div>
        </div>
      </div>

     <h2 class="text-2xl">Заголовок</h2>

      <p>TODO</p>
     
    </section>
  );
};

export default Stage;