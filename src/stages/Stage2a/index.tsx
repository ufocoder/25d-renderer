import Canvas from "@app/Canvas/CanvasBase";
import CodeBlock from "@app/components/Code";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import render2d from '@app/stages/Stage0a/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dLinedef from './render25dLinedef';
import render25dSector from './render25dSector';
import defaultSettings from './settings';

const codeLinedefs = `
  function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;
    // ..

    sector.segs.forEach(function(seg, index) {
      const projection = projectLinedef(camera, seg);
      // ...

`

const codeSectors = `
  function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;
    // ..

    settings.level.sectors!.forEach(function(sector) {
      sector.segs.forEach(function(seg, index) {
        const projection = projectLinedef(camera, seg);
        // ...

`

const Stage: Component = () => {
  const [settings] = createSignal<Settings>(defaultSettings);

  return (
    <section class="flex flex-col gap-4">

      <p class="text">TODO</p>

      <div class="grid grid-cols-1 gap-4 md:grid md:grid-cols-3 md:gap-6 md:items-start ">
        <div>
          <h4 class="flex justify-center text-xl mb-2">Уровень на основе линий</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={render25dLinedef}
          />
        </div>
         <div>
          <h4 class="flex justify-center text-xl mb-2">Вид сверху</h4>
          <Map2d
            canvasClassName='w-full'
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            settings={settings}
            render={render2d} />
        </div>
        <div>
          <h4 class="flex justify-center text-xl mb-2">Уровень на основе секторов</h4>
          <Canvas
            className='w-full'
            settings={settings}
            width={settings().camera.screen.width}
            height={settings().camera.screen.height}
            render={render25dSector}
          />
        </div>
      </div>

      <p class="text">TODO</p>

      <CodeBlock code={codeSectors} lang="ts" />

      <p class="text">TODO</p>

      <CodeBlock code={codeLinedefs} lang="ts" />

      <p class="text">TODO</p>

      <p class="my-2">
        <RepoLink filePath="stages/Stage2a/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
