import Canvas from "@app/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import { useCameraControls } from '@app/hooks/useCameraControls';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from "../Stage0b/render2d";
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
    const solidWallRanges = createSolidWallRanges(camera);

    traverseBSPTree(bspTree, camera, (bspNode: BSPLeaf) => {
      for (const seg of bspNode.segs) {
        const sector = seg.frontSector!;

        const projection = projectSeg(camera, sector, seg);

        if (!projection) {
          continue;
        }

        if (!isPortal(seg)) {
          drawSolidWall(ctx, camera, seg, projection, solidWallRanges);
        }
      }
    });
  }

`;

const code2 = `
  interface SolidSegmentRange {
    xStart: number;
    xEnd: number;
  }

  function createSolidWallRanges(camera: Camera) {
    const ranges: SolidSegmentRange[] = [];

    ranges.push({ xStart: Number.MIN_SAFE_INTEGER, xEnd: -1 });
    ranges.push({ xStart: camera.screen.width, xEnd: Number.MAX_SAFE_INTEGER });

    return ranges;
  }

`;

const code3 = `
  function drawSolidWall(
    ctx: CanvasRenderingContext2D,
    camera:Camera, 
    // .. 
    solidWallRanges: SolidSegmentRange[]
  ) {
    // ..
    const xStart = projection.start.screenX;
    const xEnd = projection.end.screenX;
    const xFrom = Math.max(0, Math.floor(Math.min(xStart, xEnd)));
    const xTo = Math.min(camera.screen.width - 1, Math.ceil(Math.max(xStart, xEnd)));
    // ..
    for (let x = xFrom; x <= xTo; x++) {
      if (!isWallVisible(x, solidWallRanges)) {
        continue;
      }
  
      // рисуем стены
    }
  
    addSolidRange(camera, xStart, xEnd, solidWallRanges);
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

      <CodeBlock code={code2} lang="ts" />
      <CodeBlock code={code3} lang="ts" />

    </section>
  );
};

export default Stage;