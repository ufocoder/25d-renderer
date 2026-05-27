import { useBspTree } from '@app/stages/Stage3a/hooks/useBspTree';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { useCameraControlsV3 } from "../Stage4b/hooks/useCameraControls";
import defaultSettings from './settings';
import CodeBlock from "@app/components/Code";
import RepoLink from "@app/components/RepoLink";

const code1 = `
  function drawPixel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: Color
  ): void {
    ctx.fillStyle = \`rgb(\${color.r}, \${color.g}, \${color.b})\`;
    ctx.fillRect(x, y, 1, 1);
  }
  
`;

const code2 = `
  export function createRender25d({ bspTree }: { bspTree: BSPNode }) {
    return function render25d(
      ctx: CanvasRenderingContext2D,
      settings: Settings,
    ) {
      const camera = settings.camera;
      const buffer = ctx.createImageData(camera.screen.width, camera.screen.height);

      for (let i = 0; i < buffer.data.length; i += 4) {
        buffer.data[i] = 0
        buffer.data[i + 1] = 0
        buffer.data[i + 2] = 0
        buffer.data[i + 3] = 255
      }

      // ..
      traverseBSPTree(bspTree, camera, (bspNode: BSPLeaf) => {
        // ..
        if (isPortal(seg)) {
          drawPortalSegment(buffer, camera, seg, angles, wallRanges, upperClip, lowerClip);
        } else {
          drawSolidSegment(buffer, camera, seg, angles, wallRanges, upperClip, lowerClip);
        }
        // ..
      });

      ctx.putImageData(buffer, 0, 0);
    }
  }
    
`;


const code3 = `
  function drawPixel(
    buffer: ImageData,
    x: number,
    y: number,
    color: Color
  ): void {
    const index = (y * buffer.width + x) * 4;

    buffer.data[index] = color.r;
    buffer.data[index + 1] = color.g;
    buffer.data[index + 2] = color.b;
    buffer.data[index + 3] = 255;
  }

`;


const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);
  const bspTree = useBspTree({ settings });

  useCameraControlsV3({ settings, setSettings, bspTree: bspTree() });

  return (
    <section class="flex flex-col gap-4">
      <p>
        При работе с <code>CanvasRenderingContext2D</code> и многократных вызовах <code>fillRect</code> накапливаются накладные расходы.
      </p>
      <CodeBlock code={code1} lang="ts"/>
      <p>
        Лучше сделать одну дорогую операцию <code>putImageData</code>, чем миллион дешевых <code>fillRect</code>. Для этого создадим буффер и будем его передавать свозь все функции вплоть до вызова <code>drawPixel</code>, а после вызовем <code>putImageData</code>.
      </p>
      <CodeBlock code={code2} lang="ts"/>
      <p>
        Внутри <code>drawPixel</code> заполняем буффер данными о необходимом пикселе.
      </p>
      <CodeBlock code={code3} lang="ts"/>
      <p class="my-2">
        <RepoLink filePath="stages/Stage5c/render25d.ts">Реализация шага на github</RepoLink>
      </p>

    </section>
  );
};

export default Stage;