import Canvas from "@app/components/Canvas/CanvasBase";
import { useCameraControls } from '@app/hooks/useCameraControls';
import render25dStage2b from '@app/stages/Stage2b/render25d';
import defaultSettingsStage2b from '@app/stages/Stage2b/settings';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dStage2c from '@app/stages/Stage2c/render25d';
import defaultSettingsStage2c from '@app/stages/Stage2c/settings';

interface StageProps {
  part?: number;
}

const Stage: Component<StageProps> = (props) => {
  const [settings2b, setSettings2b] = createSignal<Settings>(defaultSettingsStage2b);
  const [settings2c, setSettings2c] = createSignal<Settings>(defaultSettingsStage2c);

  useCameraControls<Settings>({ settings: settings2b, setSettings: setSettings2b });
  useCameraControls<Settings>({ settings: settings2c, setSettings: setSettings2c });

  const renderPart = (part: number) => {
    switch (part) {
      case 0:
        return (
          <>
            <div class="my-10 flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  Исходная проекция
                </h2>
                <div class="flex justify-center">
                  <Canvas
                    settings={settings2b}
                    width={settings2b().camera.screen.width}
                    height={settings2b().camera.screen.height}
                    render={render25dStage2b}
                  />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  Исправленная проекция
                </h2>
                <div class="flex justify-center">
                  <Canvas
                    settings={settings2c}
                    width={settings2c().camera.screen.width}
                    height={settings2c().camera.screen.height}
                    render={render25dStage2c}
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
