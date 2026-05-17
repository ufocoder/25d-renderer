import Canvas from "@app/Canvas/CanvasBase";
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render25dStage2b from '@app/stages/Stage2b/render25d';
import defaultSettingsStage2b from '@app/stages/Stage2b/settings';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dStage2c from './render25d';
import defaultSettingsStage2c from './settings';


const Stage: Component = () => {
  const [settings2b, setSettings2b] = createSignal<Settings>(defaultSettingsStage2b);
  const [settings2c, setSettings2c] = createSignal<Settings>(defaultSettingsStage2c);

  useCameraControls<Settings>({ settings: settings2b, setSettings: setSettings2b });
  useCameraControls<Settings>({ settings: settings2c, setSettings: setSettings2c });

  return (
    <section class="flex flex-col gap-4">

      <p>TODO</p>

      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">Исходная проекция</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings2b}
              width={settings2b().camera.screen.width}
              height={settings2b().camera.screen.height}
              render={render25dStage2b}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">Исправленая проекция</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings2c}
              width={settings2c().camera.screen.width}
              height={settings2c().camera.screen.height}
              render={render25dStage2c}
            />
          </div>
        </div>
      </div>

      <p>TODO</p>

      <p class="my-2">
        <RepoLink filePath="stages/Stage2c/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
