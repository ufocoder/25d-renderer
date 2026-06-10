import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from "@app/components/Map2d";
import { useBspTree } from '@app/stages/Stage3a/hooks/useBspTree';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from '@app/stages/Stage0b/render2d';
import { createRender25d } from '@app/stages/Stage5e/render25d';
import defaultSettings from '@app/stages/Stage5e/settings';
import { useCameraControlsV3 } from '@app/stages/Stage4b/hooks/useCameraControls';
import CodeBlock from "@app/components/Code";
import RepoLink from "@app/components/RepoLink";

const code1 = `
  interface Sector {
    // ...
    brightness?: number;
  }

`;

const code2 = `
  function applyBrightness(color: Color, brightness: number = 1): Color {
    if (brightness >= 1.0) {
      return color;
    }

    return {
      r: Math.min(255, Math.floor(color.r * brightness)),
      g: Math.min(255, Math.floor(color.g * brightness)),
      b: Math.min(255, Math.floor(color.b * brightness))
    };
  }
`;


const code3 = `
  function drawTexturedFloorCeil(...) {
    // ..
    drawPixel(buffer, x, y, applyBrightness(color, sector.brightness));
    // ..
  }

  function drawSolidSegment(...) {
    // ..
    drawPixel(buffer, x, y, applyBrightness(color, sector.brightness));
    // ..
  }

  function drawPortalSegment(...) {
    // ..
    drawPixel(buffer, x, y, applyBrightness(color, otherSector.brightness));
    // ..
  }
`;


const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings });

  useCameraControlsV3({ settings, setSettings, bspTree: bspTree() });

  return (
    <div class="flex flex-col gap-4">

      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              settings={settings}
              width={settings().camera.screen.width}
              height={settings().camera.screen.height}
              render={createRender25d({ bspTree: bspTree() })}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              withControls
              withVertical
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>

      <h2 class="text-2xl">Как это сделать</h2>
      <p class="py-2">
        Добавим уровень освещенности в описание сектора
      </p>
      <CodeBlock code={code1} lang="ts" />
      <p class="py-2">
        Опишем очень простую функцию для вычисления уровня освещенности 
      </p>
      <CodeBlock code={code2} lang="ts" />
      <p class="py-2">
        Теперь достаточно обернуть рассчитанные значения цвета пикселей в <code>applyBrightness</code>:
      </p>
      <CodeBlock code={code3} lang="ts" />
      <p class="py-2">
        Как видите, это дешевый в реализации, но довольно яркий эффект.
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage5e/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </div>
  );
};

export default Stage;
