import Canvas from "@app/Canvas/CanvasBase";
import CodeBlock from "@app/components/Code";
import Map2d from '@app/components/Map2d';
import RepoLink from "@app/components/RepoLink";
import Label from "@app/components/Label";
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25dLinedef from './render25dLinedef';
import render25dSector from './render25dSector';
import defaultSettings from './settings';


const codeSector = `
  interface Sector {
    segs: Seg[];
  }

  interface Seg extends Linedef {}

`;

const codeLinedefs = `
  function render25d(
    ctx: CanvasRenderingContext2D,
    settings: Settings,
  ) {
    const camera = settings.camera;
    // ..

    settings.level.linedefs.forEach(function(linedef, index) {
      const projection = projectLinedef(camera, linedef);
      // ..

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

      <p class="py-2 text">        
        Введем понятие сектора как множества стен образующих многоугольник.
      </p>

      <p class="py-2 text">        
        Также вместо <Label>Linedef</Label> будет использовать <Label>Seg</Label>, поскольку линия может быть разбита на сегменты.
      </p>

      <CodeBlock code={codeSector} lang="ts" />

      <div class="my-10 grid grid-cols-1 gap-4 md:grid md:grid-cols-3 md:gap-6 md:items-start ">
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

      <p class="py-2 text">
        И если раньше мы строили проекции на основе множества <Label>Linedef</Label> из уровня:
      </p>


      <CodeBlock code={codeLinedefs} lang="ts" />

      <p class="py-2 text">
        То теперь строим на основе множества <Label>Seg</Label>, которое содержит каждый сектор:
      </p>

      <CodeBlock code={codeSectors} lang="ts" />

      <p class="my-2">
        <RepoLink filePath="stages/Stage2a/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;
