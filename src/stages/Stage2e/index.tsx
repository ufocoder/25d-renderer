import Canvas from "@app/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0a/render2d';
import render25dStage2d from "@app/stages/Stage2d/render25d";
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import defaultSettings from './settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <p>Зная координаты вершин стены, достроим вертикальные линии и получим разукрушенные пол и потолок</p>

      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={render25dStage2d}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              withControls
              width={400}
              height={320}
              settings={settings}
              render={render2d} />
          </div>
        </div>
      </div>

      <p class="my-2">
        <RepoLink filePath="stages/Stage2e/render25d.ts">Реализация шага на github</RepoLink>
      </p>

    </section>
  );
};

export default Stage;
