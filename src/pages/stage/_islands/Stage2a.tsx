import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dLinedef from '@app/stages/Stage2a/render25dLinedef';
import render25dSector from '@app/stages/Stage2a/render25dSector';
import defaultSettings from '@app/stages/Stage2a/settings';

interface StageProps {
  part?: number;
}

const Stage: Component<StageProps> = (props) => {
  const [settings] = createSignal<Settings>(defaultSettings);

  const renderPart = (part: number) => {
    switch (part) {
      case 0:
        return (
          <>
            <div class="my-10 grid grid-cols-1 gap-4 md:grid md:grid-cols-3 md:gap-6 md:items-start ">
              <div>
                <h4 class="flex justify-center text-xl mb-2">
                  Уровень на основе линий
                </h4>
                <Canvas
                  className='w-full'
                  settings={settings}
                  width={settings().camera.screen.width}
                  height={settings().camera.screen.height}
                  render={render25dLinedef}
                />
              </div>
              <div>
                <h4 class="flex justify-center text-xl mb-2">
                  Вид сверху
                </h4>
                <Map2d
                  canvasClassName='w-full'
                  width={settings().camera.screen.width}
                  height={settings().camera.screen.height}
                  settings={settings}
                  render={render2d}
                />
              </div>
              <div>
                <h4 class="flex justify-center text-xl mb-2">
                  Уровень на основе секторов
                </h4>
                <Canvas
                  className='w-full'
                  settings={settings}
                  width={settings().camera.screen.width}
                  height={settings().camera.screen.height}
                  render={render25dSector}
                />
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
