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
  const sector1 = {
    height: 10_000,
    segs: createCircleLines(150, 130, 85, 8)
  };

  const sector2 = {
    height: 7_500,
    segs: createCircleLines(150, 130, 10, 10)
  };

  const sector3 = {
    height: 5_000,
    segs: createCircleLines(150, 130, 15, 10)
  };

  const sector4 = {
    height: 2_500,
    segs: createCircleLines(150, 130, 20, 10)
  };

`
const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <p>Так же проекция, но только разные высоты стен</p>


      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
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
            width={400}
            height={320}
            settings={settings}
            render={render2d} />
          </div>
        </div>
      </div>

      <CodeBlock code={code1} lang="ts" />

      <p class="my-2">
        <RepoLink filePath="stages/Stage2a/render25d.ts">Реализация шага на github</RepoLink>
      </p>

    </section>
  );
};

export default Stage;
