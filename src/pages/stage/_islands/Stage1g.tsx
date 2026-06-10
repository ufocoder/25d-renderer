import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import render25d from '@app/stages/Stage1g/render25d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import defaultSettings from '@app/stages/Stage1g/settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <div class="flex flex-col gap-4">

      <p class="py-2 text">
        На первый взгляд, используя текущие наработки, кажется, что мы вполне успешно можем строить уровни с произвольной геометрией, если сравнивать их с лабиринтами из <a class="link underline" href="https://en.wikipedia.org/wiki/Wolfenstein_3D">Wolfenstein 3D</a>:
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
              initialZoom={0.6}
              initialOffsetX={0}
              initialOffsetY={40}
              withControls
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>
      <p class="py-2 text">
        Однако использование алгоритма художника не гарантирует корректной отрисовки стен, возможны пересечения. Также алгоритм художника ставит нас в тупик производительности — возможны лишние операции. В зависимости от геометрии уровня и расположения камеры, стены могут залезать одна на другую.
      </p>
      <p class="py-2 text">
        И теперь поставим задачу по-другому: <span class="font-semibold">необходимо отрисовывать стены так, чтобы не происходило наложений</span>.
      </p>
      <p class="py-2 text">
        Зафиксируем эту проблему, но вернемся к ней несколько позже.
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage1g/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </div>
  );
};

export default Stage;
