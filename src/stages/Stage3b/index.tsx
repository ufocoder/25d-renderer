import Canvas from "@app/Canvas/CanvasBase";
import { JsonViewer } from '@app/components/JsonViewer';
import render2dStage0 from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { simplifyBSP } from './bsp/debug';
import { useBspTree } from "./hooks/useBspTree";
import renderBSP from './renderBSP';
import defaultSettings from './settings/sectors.column';

const Stage: Component = () => {
  const [settings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings});

  return (
    <section class="flex flex-col gap-4">
      
      <p class="py-2 text">
        Мы не можем нарисовать сектор в секторе, но мы можем разбить сектора таким образом, чтобы на уровне не было внутрених секторов. Благодаря реализации этой идеи прославился в свое время Джон Кармак, а именно тем, что стал использовать алгоритм Binary Space Partition.
      </p>

      <p class="py-2 text">
        Кратко: выберем некоторые линии в качестве разделителей. Затем будем разбивать уровень на две части относительно этих линий разделителей. Разбивать будем до тех пор пока не получим подпростанства образующие выпуклые многоугольник. Полученное разбиение мы представляем в виде дереве. Обратный обход по дереву позволит нам гарантировать, что отсовка стен будет от ближних к дальним, а это позволит перейти к идеи об использовании порталов.
      </p>

      <p class="py-2 text">
        Рассмотрим для уровня из прошлой заметки, как будет строиться разбитие на пространство
      </p>

      <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              width={400}
              height={400}
              settings={settings}
              render={render2dStage0} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
             <Canvas
              width={400}
              height={400}
              settings={settings}
              render={renderBSP} />
          </div>
        </div>
      </div>

      <p class="py-2 text">
        Поскольку в будущем при обходе дерева нам важно понимать с какой стороны от разделителя находится камера, алгоритм подготовки дерева, еще обязан проверить, что все сегменты направлены по часовой или против часовой стрелке. Как следстве линия разделитель может попадать в два пространства с противоположными направлениями.
      </p>

      <p class="py-2 text">
        На результат, помимо геометрии уровня, очень сильно влияет изначально выбранные разделители.
      </p>

      <h2 class="text-2xl">Содержимое дерева</h2>

      <p class="py-2 text">
        Получившиеся BSP-дерево в виде JSON
      </p>

      <div class="flex flex-col">
        <JsonViewer data={simplifyBSP(bspTree())} />
      </div>
    </section>
  );
};

export default Stage;