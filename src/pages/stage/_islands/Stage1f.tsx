import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import render25dstage1e from '@app/stages/Stage1e/render25d';
import defaultSettings from '@app/stages/Stage1f/settings';
import { processLevel } from '@app/stages/Stage1f/utils';
import Label from "@app/components/Label";

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);
  const [settings2, setSettings2] = createSignal<Settings>(processLevel(settings()));
  
  createEffect(() => {
    setSettings2(processLevel(settings()));
  });

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <div class="flex flex-col gap-4">

      <p class="py-2 text">
        Другая проблема <a href="https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D1%85%D1%83%D0%B4%D0%BE%D0%B6%D0%BD%D0%B8%D0%BA%D0%B0" class="link underline" target="_blank">Алгоритма художника</a> — он никак не учитывает стены, пересекающие друг друга. В случае пересечения стен получится так, что то одна стена будет рисоваться поверх другой, то другая, в зависимости от положения камеры на карте.
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
        Для решения достаточно определить вершину пересечения отрезков и разбить их относительно этой вершины:
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
        Кстати, чтобы разделять такие линии, в DOOM присутствует сущность <Label>Linedef</Label> и сущность <Label>Seg</Label>, то есть сегмент. В будущем мы будем оперировать сегментами вместо отрезков. Теперь получается, что после построения уровня мы работаем с сегментами и само это название наталкивает нашу интуицию на отсутствие пересечений.
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage1f/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </div>
  );
};

export default Stage;
