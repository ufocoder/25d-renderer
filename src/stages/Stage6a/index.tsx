import { createSignal } from 'solid-js';
import type { Component } from 'solid-js';
import Canvas from "@app/components/Canvas";
import render2dStage0 from '@app/stages/Stage0/render2d';
import { JsonViewer } from '@app/components/JsonViewer';
import render2dStage6 from './render2d';
import settings1 from './settings/single.sector.column';
import settings2 from './settings/single.sector.pyramid';
import settings3 from './settings/sectors.column';
import settings4 from './settings/sectors.pyramid';
import settings5 from './settings/sectors.corridor';
import settings6 from './settings/single.sector.stairs.a';
import settings7 from './settings/single.sector.stairs.b';
import { buildBSPTree } from './bsp/build';

const settingsSet = [
  settings1,
  settings2,
  settings3,
  settings4,
  settings5,
  settings6,
  settings7,
]

interface RowProps {
  settings: Settings,
  scale?: number;
}

const Row: Component<RowProps> = ({ settings: defaultSettings, scale = 0.4 }) => {
  const [settings] = createSignal<Settings>(defaultSettings);

  return (
      <div class="grid grid-cols-3 gap-4">
        <Canvas
          width={400}
          height={320}
          settings={settings}
          render={render2dStage0} />
        <Canvas
          scale={scale}
          width={400}
          height={320}
          settings={settings}
          render={render2dStage6} />
        <JsonViewer data={buildBSPTree(settings().level.linedefs)} />
      </div>
  );
};

const Stage5: Component = () => {
  return (
    <section class="flex flex-col gap-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="mt-4 flex flex-col">
          <h2 class="text-2xl">2.5D Renderer</h2>
        </div>
        <div class="mb-2 mt-4">
          <h2 class="text-2xl">2D Renderer</h2>
        </div>
        <div class="mb-2 mt-4">
          <h2 class="text-2xl">Debug JSON</h2>
        </div>
      </div>
      {settingsSet.map(settings => (
        <Row settings={settings} />
      ))}
    </section>
  );
};

export default Stage5;