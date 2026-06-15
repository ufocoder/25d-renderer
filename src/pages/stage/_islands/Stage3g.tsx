import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2dStage0 from '@app/stages/Stage0b/render2d';
import render25d from '@app/stages/Stage3d/render25d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import defaultSettings from '@app/stages/Stage3g/settings';

interface StageProps {
  part?: number;
}

const Stage: Component<StageProps> = (props) => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings, withVertical: true });

  const renderPart = (part: number) => {
    switch (part) {
      case 0:
        return (
          <>
            <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  2.5D Renderer
                </h2>
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
                <h2 class="flex justify-center text-2xl">
                  2D Renderer
                </h2>
                <div class="flex justify-center">
                  <Map2d
                    withControls
                    withVertical
                    width={400}
                    height={320}
                    settings={settings}
                    render={render2dStage0}
                  />
                </div>
              </div>
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