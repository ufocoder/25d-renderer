import Canvas from "@app/Canvas/CanvasBase";
import { Formula } from '@app/components/Formula';
import Map2d from "@app/components/Map2d";
import RepoLink from "@app/components/RepoLink";
import Content from '@app/components/Сontent';
import { useCameraControls } from '@app/hooks/useCameraControls';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from "../Stage0a/render2d";
import { createRender25d } from './render25d';
import defaultSettings from './settings';


const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      <p class="my-2">Вычисление высоты не зависит от угла относительно камеры</p>

      <div class="flex flex-col justify-center gap-6 justify-items md:grid md:grid-cols-2 md:gap-4 md:items-start">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={createRender25d({ withFix: false })}
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
      
      <p>TODO</p>

      <div class="flex flex-col gap-2">
        <h2 class="flex justify-center text-2xl">Исправленная проекция</h2>
        <div class="flex justify-center">
          <Canvas
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={createRender25d({ withFix: true })}
          />
        </div>
      </div>

      <p>TODO</p>

      <h2 class="text-2xl">Как это рассчитать</h2>
      <p class="py-2">
        Расчитаем относительный угол между направлением камеры и направлением на вершину:
      </p>
      <Content class="my-2">
        <Formula latex="\theta_{\text{rel}} = \theta_{\text{vertex}} - \theta_{\text{camera}}" />
      </Content>
      <p class="py-2">
        Проекционное расстояние (с учётом угла обзора):
      </p>
      <Content class="my-2">
        <Formula latex="d = \sqrt{\Delta x^2 + \Delta y^2}" />
        <Formula latex="d_{\text{proj}} = d \cdot \cos(\theta_{\text{rel}})" />
        <Formula latex="h = \frac{H_{\text{wall}}}{d_{\text{proj}}}" />
      </Content>
      <p class="my-2">
        <RepoLink filePath="stages/Stage1c/render25d.ts">Реализация шага на github</RepoLink>
      </p>

    </section>
  );
};

export default Stage;
