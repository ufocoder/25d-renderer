import Canvas from "@app/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import { useCameraControls } from '@app/hooks/useCameraControls';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from "../Stage0a/render2d";
import render25d from './render25d';
import defaultSettings from './settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              width={400}
              height={320}
              settings={settings}
              render={render25d} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              initialZoom={0.8}
              initialOffsetY={90}
              width={400}
              height={320}
              settings={settings}
              render={render2d} />
          </div>
        </div>
      </div>

    </section>
  );
};

export default Stage;