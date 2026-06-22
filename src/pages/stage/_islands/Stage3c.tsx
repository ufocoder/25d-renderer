import Canvas from "@app/components/Canvas/CanvasBase";
import render2dStage0 from '@app/stages/Stage0b/render2d';

import settings5 from '@app/stages/Stage3b/settings/sectors.corridor';
import settings4 from '@app/stages/Stage3b/settings/sectors.pyramid';
import settings2 from '@app/stages/Stage3b/settings/single.sector.pyramid';
import settings6 from '@app/stages/Stage3b/settings/single.sector.stairs.a';
import settings7 from '@app/stages/Stage3b/settings/single.sector.stairs.b';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { useBspTree } from '@app/stages/Stage3b/hooks/useBspTree';
import createRender2d from '@app/stages/Stage3c/renderBSP';

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
  const bspTree = useBspTree({ settings });

  return (
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
      <div class="flex min-w-0 flex-col items-center gap-2">
        <h2 class="text-xl md:hidden">2.5D Renderer</h2>
        <Canvas
          width={400}
          height={400}
          settings={settings}
          render={render2dStage0}
          className="h-auto w-full max-w-[400px]"
        />
      </div>
      <div class="flex min-w-0 flex-col items-center gap-2">
        <h2 class="text-xl md:hidden">2D Renderer</h2>
        <Canvas
          width={400}
          height={400}
          settings={settings}
          render={createRender2d(bspTree())}
          className="h-auto w-full max-w-[400px]"
        />
      </div>
    </div>
  );
};

const Stage: Component = () => {
  return (
    <div class="flex flex-col gap-6 md:gap-4">
      <div class="hidden grid-cols-2 gap-4 md:grid">
        <h2 class="text-center text-2xl">2.5D Renderer</h2>
        <h2 class="text-center text-2xl">2D Renderer</h2>
      </div>
      {settingsSet.map((settings) => (
        <Row settings={settings} />
      ))}
    </div>
  );
};

export default Stage;
