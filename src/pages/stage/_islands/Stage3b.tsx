import Canvas from "@app/components/Canvas/CanvasBase";
import { JsonViewer } from '@app/components/JsonViewer';
import render2dStage0 from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { simplifyBSP } from '@app/stages/Stage3b/bsp/debug';
import { useBspTree } from '@app/stages/Stage3b/hooks/useBspTree';
import renderBSP from '@app/stages/Stage3b/renderBSP';
import defaultSettings from '@app/stages/Stage3b/settings/sectors.column';

interface StageProps {
  part?: number;
}

const Stage: Component<StageProps> = (props) => {
  const [settings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings });

  const renderPart = (part: number) => {
    switch (part) {
      case 0:
        return (
          <>
            <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  2.5D Renderer
                </h2>
                <div class="flex justify-center">
                  <Canvas
                    width={400}
                    height={400}
                    settings={settings}
                    render={render2dStage0}
                  />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  2D Renderer
                </h2>
                <div class="flex justify-center">
                  <Canvas
                    width={400}
                    height={400}
                    settings={settings}
                    render={renderBSP}
                  />
                </div>
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div class="flex flex-col">
              <JsonViewer data={simplifyBSP(bspTree())} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div class="flex flex-col gap-4">
      {renderPart(props.part ?? 0)}
    </div>
  );
};

export default Stage;
