import Canvas from "@app/components/Canvas/CanvasBase";
import { Formula } from '@app/components/Formula';
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import Content from '@app/components/Сontent';
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d from '@app/stages/Stage1b/render25d';
import defaultSettings from '@app/stages/Stage1b/settings';
import CodeBlock from "@app/components/Code";
import Label from "@app/components/Label";


const code1 = `
  function projectionToPoints(
    camera: Camera,
    vertexProjectionStart: VertexProjection,
    vertexProjectionEnd: VertexProjection,
  ): Vertex[] {
    const wallStartHeight = vertexProjectionStart.height;
    const wallEndHeight = vertexProjectionEnd.height;
    const horizontalHeight = camera.screen.height / 2;

    return [
      {
        x: vertexProjectionStart.screenX,
        y: horizontalHeight - wallStartHeight / 2,
      },
      {
        x: vertexProjectionStart.screenX,
        y: horizontalHeight + wallStartHeight / 2,
      },
      { x: vertexProjectionEnd.screenX, y: horizontalHeight + wallEndHeight / 2 },
      { x: vertexProjectionEnd.screenX, y: horizontalHeight - wallEndHeight / 2 },
    ];
  }

`;

const code2 = `
  function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    for (const linedef of settings.level.linedefs) {
      const vertexProjectionStart = projectVertexToScreen(settings.camera, linedef.start);
      const vertexProjectionEnd = projectVertexToScreen(settings.camera, linedef.end);
  
      if (!vertexProjectionStart || !vertexProjectionEnd) {
        continue;
      }
  
      drawPolygon(
        ctx,
        projectionToPoints(settings.camera, vertexProjectionStart, vertexProjectionEnd),
      );
    }
  }

`;


const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <div class="flex flex-col gap-4">
      <p class="text">
        На этом шаге мы можем воспользоваться следующей идеей: зная высоту предмета на конкретном расстоянии, мы можем найти его высоту на любом другом расстоянии, используя пропорцию. А зная высоту, мы можем получить координату Y для нижней и верхней части этого предмета.
      </p>
      <p class="text">
        Таким образом, для каждой вершины из отрезка мы вычисляем расстояние, затем получаем два значения Y для его верхней и нижней части. Теперь, если соединить эти точки, то мы получим четырехугольник.
      </p>
      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
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
      <p class="py-2 text">
        Определим расстояние от позиции камеры до точки 
      </p>
      <Content>
        <Formula latex="d = \sqrt{\Delta x^2 + \Delta y^2}" />
      </Content>
      <p class="py-2 text">
        Пусть на расстоянии 1 высота стены будет равна константе <Label>H wall</Label>, тогда на расстоянии <Label>d</Label>, высота:
      </p>
      <Content>
        <Formula latex="h = \frac{H_{\text{wall}}}{d}" />
      </Content>
      <p class="py-2 text">
        На основе проекции <Label>screenX</Label> на экран и найденной высоте стены <Label>h</Label> формируем координаты четырехугольника. 
      </p>
      <h2 class="text-2xl">Немного кода</h2>
      <p class="py-2 text">
        Ранее спроецированные точки достраиваем до четырехугольника:
      </p>
      <CodeBlock code={code1} lang="ts" />
      <p class="py-2 text">
        И теперь на их основе рисуем многоугольник на экране:
      </p>
      <CodeBlock code={code2} lang="ts" />
      <p class="my-2">
        <RepoLink filePath="stages/Stage1b/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </div>
  );
};

export default Stage;
