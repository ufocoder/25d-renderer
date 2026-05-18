import Canvas from "@app/Canvas/CanvasBase";
import { Formula } from '@app/components/Formula';
import Map2d from '@app/components/Map2d';
import RepoLink from '@app/components/RepoLink';
import Content from '@app/components/Сontent';
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d from './render25d';
import defaultSettings from './settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      <p class="text">Проекция вершины на камеру в виде вертикальной линии</p>

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

      <h2 class="text-2xl">Как это рассчитать</h2>

      <p>
        Введем условные обозначения:
      </p>

      <Content class="my-2">
        <Formula latex="\Delta x = x_{\text{vertex}} - x_{\text{camera}}" />
        <Formula latex="\Delta y = y_{\text{vertex}} - y_{\text{camera}}" />
        <Formula latex="\theta_{\text{fov}} \text{ — угол поля обзора камеры (FOV)}" />
        
        <Formula latex="W \text{ — ширина экрана в пикселях}" />
      </Content>

      <p class="text">
        Вычисляем угол между направлением камеры и вершиной на карте
      </p>

      <Content class="my-2">
          <Formula latex="\theta_v = \operatorname{arctan2}(\Delta y, \Delta x) \cdot \frac{180}{\pi}" />
      </Content>

      <p class="text">
        Если угол входит в поле обзора камеры, мы линейно преобразуем его относительное положение внутри FOV в координату X на экране
      </p>
      
      <Content class="my-2">
        <Formula latex="\theta_{\min} = \theta_{\text{cam}} - \frac{\theta_{\text{fov}}}{2}" />
        <Formula latex="\text{screenX} = \frac{\theta_v - \theta_{\text{min}}}{\theta_{\text{fov}}} \cdot W" /> 
      </Content>

      <p class="my-2">
        <RepoLink filePath="stages/Stage1a/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;