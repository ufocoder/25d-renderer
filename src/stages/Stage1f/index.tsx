import Canvas from "@app/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import render25dstage1e from '../Stage1e/render25d';
import defaultSettings from './settings';
import { processLevel } from './utils';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);
  const [settings2, setSettings2] = createSignal<Settings>(processLevel(settings()));
  
  createEffect(() => {
    setSettings2(processLevel(settings()));
  });

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <p class="py-2 text">
        Алгоритма художника никак не учитывает стены, пересекающие друг друга. В случае пересечения получаться так, что то одна стена рисуется поверх второй, то другая, в зависимости от положения камеры на карте.
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={render25dstage1e}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>

      <p class="text py-2">
        Чтобы исключить эту проблему, достаточно в месте пересчения линий разбивать их и тогда две песекающиеся линии дадут четыре новых.
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings2}
              width={settings2().camera.screen.width}
              height={settings2().camera.screen.height}
              render={render25dstage1e}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              withControls
              settings={settings2}
              render={render2d}
            />
          </div>
        </div>
      </div>
      <p class="text py-2">
        Кстати, чтобы разделять такие линии в DOOM присутствует сущность Linedef и сущность Seg, то есть сегмент. Получается, что после построения уровня мы работаем с сегментами и само это понятия говорит об отсутствии пересечений.
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage1f/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
