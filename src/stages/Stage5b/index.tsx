import Canvas from "@app/Canvas/CanvasBase";
import Map2d from "@app/components/Map2d";
import { useBspTree } from '@app/stages/Stage3a/hooks/useBspTree';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from "../Stage0b/render2d";
import { useCameraControlsV3 } from "../Stage4b/hooks/useCameraControls";
import { createRender25d } from './render25d';
import defaultSettings from './settings';
import RepoLink from "@app/components/RepoLink";
import CodeBlock from "@app/components/Code";


const code1 = `
  interface Sector {
    // ..
    wallTexture: string;
  }

`;

const code2 = `
  function drawSolidSegment(
    ctx: CanvasRenderingContext2D,
    camera: Camera, 
    seg: Seg,
    angles: IntersectionAngles, 
    // ..
  ) {
    // ..  

    for (let x = xFrom; x <= xTo; x++) {
      // ..
      const tx = getInterpolationFactor(camera, angles, x);
      // ..

      if (sector.wallTexture) {
        const texture = textures[sector.wallTexture];
        const texX = Math.floor(tx * texture.width);
        
        for (let y = drawTop; y < drawBottom; y++) {
          const v = (y - top) / (bottom - top);
          const texY = Math.floor(v * texture.height) % texture.height;        
          const color = getTextureColor(texture, texX, texY);
          
          drawPixel(ctx, x, y, color);
        }
      } else {
        drawVerticalLine(ctx, x, drawTop, drawBottom, wallColor);
      }
      // ..
    }

    // ..
  }
`;

const code3 = `
  function getInterpolationFactor(
    camera: Camera,
    angles: IntersectionAngles,
    screenX: number,
  ): number {
    const fov = camera.fov.degrees;
    const screenWidth = camera.screen.width;
    const angle = angles.cameraFrom + (screenX / screenWidth) * fov;
    const t = (angle - angles.linedefFrom) / (angles.linedefTo - angles.linedefFrom);
    
    return Math.max(0, Math.min(1, t));
  }

`;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings });

  useCameraControlsV3({ settings, setSettings, bspTree: bspTree() });

  return (
    <section class="flex flex-col gap-4">

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
              initialZoom={50}
              initialOffsetX={50}
              initialOffsetY={50}
              settings={settings}
              render={render2d}
            />
          </div>
        </div>
      </div>
      <p class="py-2">
        Добавим ID текстуры стены в описание сектора
      </p>
      <CodeBlock code={code1} lang="ts" />
      <p class="py-2">
        На примере <code>drawSolidSegment</code> расчитаем координату текстуры для текущей экранной координаты 
      </p>
      <CodeBlock code={code2} lang="ts" />
      <p class="py-2">
        Где <code>getInterpolationFactor</code>:
      </p>
      <CodeBlock code={code3} lang="ts" />
      <p class="my-2">
        <RepoLink filePath="stages/Stage5b/render25d.ts">Реализация шага на github</RepoLink>
      </p>

    </section>
  );
};

export default Stage;