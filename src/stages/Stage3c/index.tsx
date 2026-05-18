import Canvas from "@app/Canvas/CanvasBase";
import render2dStage0 from '@app/stages/Stage0a/render2d';

import settings5 from '@app/stages/Stage3b/settings/sectors.corridor';
import settings4 from '@app/stages/Stage3b/settings/sectors.pyramid';
import settings2 from '@app/stages/Stage3b/settings/single.sector.pyramid';
import settings6 from '@app/stages/Stage3b/settings/single.sector.stairs.a';
import settings7 from '@app/stages/Stage3b/settings/single.sector.stairs.b';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { useBspTree } from "../Stage3a/hooks/useBspTree";
import createRender2dStage6 from './renderBSP';

const settingsSet = [
  settings2,
  settings4,
  settings5,
  settings6,
  settings7,
]

interface RowProps {
  settings: Settings,
  scale?: number;
}

const Row: Component<RowProps> = ({ settings: defaultSettings }) => {
  const [settings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings })

  return (
      <div class="grid grid-cols-2 gap-4">
        <Canvas
          width={400}
          height={400}
          settings={settings}
          render={render2dStage0} />
        <Canvas
          width={400}
          height={400}
          settings={settings}
          render={createRender2dStage6(bspTree())} />
      </div>
  );
};

const Stage: Component = () => {
  return (
    <section class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="mt-4 flex flex-col">
          <h2 class="text-2xl">2.5D Renderer</h2>
        </div>
        <div class="mb-2 mt-4">
          <h2 class="text-2xl">2D Renderer</h2>
        </div>
      </div>
      {settingsSet.map(settings => (
        <Row settings={settings} />
      ))}
    </section>
  );
};

export default Stage;