import Canvas from "@app/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d from './render25d';
import defaultSettings from './settings';
import CodeBlock from "@app/components/Code";


const code1 = `
  function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;
    const allSegments = settings.level.linedefs;
    const bspTree = buildBSPTree(allSegments);
  
    const wallRanges = createSolidWallRanges(camera);
    const upperClip = new Array(camera.screen.width).fill(-1);
    const lowerClip = new Array(camera.screen.width).fill(camera.screen.height)
  
    traverseBSPTree(bspTree, camera, (bspNode: BSPLeaf) => {
      for (const seg of bspNode.segs) {
        const sector = seg.frontSector!;
  
        const projection = projectSeg(camera, sector, seg);
  
        if (!projection) {
          continue;
        }
  
        if (isPortal(seg)) {
          drawPortalSegment(ctx, camera, seg, projection, wallRanges, upperClip, lowerClip);
        } else {
          drawSolidSegment(ctx, camera, seg, projection, wallRanges, upperClip, lowerClip);
        }
      }
    });
  }
  
`;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">

      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
              width={400}
              height={320}
              settings={settings}
              render={render25d} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
              initialZoom={0.8}
              initialOffsetY={90}
              width={400}
              height={320}
              settings={settings}
              render={render2d} />
          </div>
        </div>
      </div>

      <h2 class="text-2xl">Немного кода</h2>

      <CodeBlock code={code1} lang="ts" />

    </section>
  );
};

export default Stage;