import Canvas from "@app/Canvas/CanvasBase";
import { JsonViewer } from '@app/components/JsonViewer';
import render2dStage0 from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { simplifyBSP } from './bsp/debug';
import { useBspTree } from "./hooks/useBspTree";
import render2dStage6 from './renderBSP';
import defaultSettings from './settings/sectors.column';

const Stage: Component = () => {
  const [settings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings});

  return (
    <section class="flex flex-col gap-4">
      
      <p>TODO</p>


      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
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
              render={render2dStage6} />
          </div>
        </div>
      </div>

     <h2 class="text-2xl">Содержимое дерева</h2>

      <p>Получившиеся BSP-дерево в виде JSON</p>

      <div class="flex flex-col">
        <JsonViewer data={simplifyBSP(bspTree())} />
      </div>
    </section>
  );
};

export default Stage;