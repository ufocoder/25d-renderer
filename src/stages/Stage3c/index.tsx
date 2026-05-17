import Canvas from "@app/Canvas/CanvasBase";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2dStage0 from '@app/stages/Stage0a/render2d';
import render2dStage6 from '@app/stages/Stage3a/renderBSP';
import defaultSettings from '@app/stages/Stage3a/settings/sectors.column';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d from './render25d';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <div class="grid grid-cols-2 gap-4">
        <div class="mt-4 flex flex-col">
          <h2 class="text-2xl">2.5D Renderer</h2>
        </div>
        <div class="mb-2 mt-4">
          <h2 class="text-2xl">2D Renderer</h2>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="grid gap-4">
          <h4 class="text">BSP</h4>
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={render25d}
            />
        </div>
        <div>
          <Canvas
            width={400}
            height={320}
            settings={settings}
            render={render2dStage0} />

          <Canvas
            width={400}
            height={320}
            settings={settings}
            render={render2dStage6} />
        </div>
      </div>
    </section>
  );
};

export default Stage;