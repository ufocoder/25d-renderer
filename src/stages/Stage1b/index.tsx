import Canvas from "@app/Canvas/CanvasBase";
import { Formula } from '@app/components/Formula';
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import Content from '@app/components/Сontent';
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d from './render25d';
import defaultSettings from './settings';


const Label = (props: any) => <code class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">{props.children}</code>;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <p class="text">Преобразование спроецированных точек в координаты многоугольника</p>

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
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>

      <h2 class="text-2xl">Как это рассчитать</h2>
      <p class="py-2">
        Определим расстояние от позиции камеры до точки 
      </p>
      <Content class="my-2">
        <Formula latex="d = \sqrt{\Delta x^2 + \Delta y^2}" />
      </Content>
      <p class="py-2">
        Пусть на расстоянии 1 высота стены будет равна константе <Label>H wall</Label>, тогда на расстоянии <Label>d</Label>, высота:
      </p>
      <Content class="my-2">
        <Formula latex="h = \frac{H_{\text{wall}}}{d_{\text{proj}}}" />
      </Content>
      <p class="py-2">
        На основе проекции <Label>screenX</Label> на экран и найденной высоте стены <Label>h</Label> формируем координаты четырехугольника. 
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage1b/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
