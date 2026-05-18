import CodeBlock from '@app/components/Code';
import Map2d from '@app/components/Map2d';
import RepoLink from '@app/components/RepoLink';
import { useCameraControls } from '@app/hooks/useCameraControls';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from './render2d';
import defaultSettings from './settings';

const code1 = `
  interface Vertex {
    x: number;
    y: number;
  }

  interface Linedef {
    start: Vertex;
    end: Vertex;
  }

`;

const code2 = `
  class Angle {
    private _degrees: number;

    constructor(degrees: number) {
      this._degrees = ((degrees % 360) + 360) % 360;
    } 
    
    get degrees() {
      return this._degrees;
    }
    
    get radians() {
      return this._degrees * Math.PI / 180;
    }

    get cos() {
      return Math.cos(this.radians);
    }

    get sin() {
      return Math.sin(this.radians);
    }
  }
`;

const code3 = `
  interface Camera {
    angle: Angle;
    fov: Angle;
    x: number;
    y: number;
    moveSpeed: number;
    rotationSpeed: number;
  }

`;

const code4 = `
  type Level = {
    linedefs: Linedef[];
  }

  interface Settings {
    camera: Camera;
    level: Level;
  }

`;

const code5 = `
  function render2d(ctx: CanvasRenderingContext2D, settings: Settings) {
    const camera = settings.camera;

    // ...
    for (const linedef of settings.level.linedefs) {
      drawLinedef(ctx, scaleLinedef(linedef));
    }
    // ...
  }

`;

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      <p class="py-2">
        Если вы не знали, то ранние шутеры <a class="link underline" href="https://en.wikipedia.org/wiki/Wolfenstein_3D">Wolfenstein 3D</a> и <a class="link underline" href="https://en.wikipedia.org/wiki/Doom_(1993_video_game)">DOOM</a> от компании <a class="link underline" href="https://en.wikipedia.org/wiki/Id_Software">Id software</a> были псевдо-трехмерными. Разработчики хитрым образом достраивали еще одно измерение на основе двумерной карты и проекции на воображаемый экран камеры.
      </p>
      <p class="py-2">
        Поэтому очевидно, что необходимио начать с двумерной карты и для этого нам потребуется ввести некоторые абстракции.
      </p>
      <p class="py-2">
        Вершина и отрезок. 
      </p>
      <CodeBlock code={code1} lang='ts'/>
      <p class="py-2">
        Угол
      </p>
      <CodeBlock code={code2} lang='ts'/>
      <p class="py-2">
        Камера 
      </p>
      <CodeBlock code={code3} lang='ts'/>
      <p class="py-2">
        TODO 
      </p>
      <Map2d
        withZoom
        withDebug
        withControls
        width={settings().camera.screen.width} 
        height={settings().camera.screen.height} 
        settings={settings}
        render={render2d} />
      <p class="py-2">
        TODO 
      </p>
      <CodeBlock code={code4} lang='ts'/>
      <p class="py-2">
        TODO 
      </p>
      <CodeBlock code={code5} lang='ts'/>
      <p class="py-2">
        TODO 
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage0/render2d.ts">Исходники шага на Github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;