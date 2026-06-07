import Canvas from "@app/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dStage1d2 from './render25dBefore';
import render25d from './render25d';
import defaultSettings from './settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      <p class="py-2 text">
        Сейчас стены отрисовываются в том порядке, в каком были описаны для уровня и может получиться так, что фактически самая дальняя от камеры стена нарисуется ближе всех или наоборот. Чтобы вам было визуально проще обнаружить проблему, на демо ниже я разукрасил стены различными цветами.
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={render25dStage1d2}
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

      <p class="py-2 text">
        Решение проблема заключается в том, чтобы отсортировать стены по расстоянию от камеры перед их отрисовкой. Сначала рисуем дальние стены и только затем ближние. Кстати, такой алгоритм отрисовки называется <a href="https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D1%85%D1%83%D0%B4%D0%BE%D0%B6%D0%BD%D0%B8%D0%BA%D0%B0" class="link underline" target="_blank">Алгоритмом художника</a>:
      </p>
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
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>
      <p class="py-2 text">  
        Однако, у алгоритма художника есть один большой недостаток — он может делать ненужные  отрисовки.
      </p>
      <p class="py-2 text">
        Представьте, вы находитесь перед стеной, причем стена полностью попадает в область видимости камеры и больше на экране, кроме этой стены ничего в конечном счете не должно быть отрисовано. Одновременно с этим за этой стеной находится бесконечное количество стен на различном отдалении от камеры. Согласно алгоритму художника, нам придется отрисовать все эти стены от дальней к ближней, когда в действительности необходима только одна. Мы делаем лишние отрисовки. Другими словами, может получиться так, что мы покрасим некоторые пиксели на экране несколько раз.
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage1e/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
