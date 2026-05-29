import CodeBlock from '@app/components/Code';
import Map2d from '@app/components/Map2d';
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
  interface Settings {
    camera: Camera;
    level: Level;
  }

  type Level = {
    linedefs: Linedef[];
  }

`;


const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <section class="flex flex-col gap-4">
      <p class="py-2 text">
        Если вы не знали, то ранние шутеры <a class="link underline" href="https://en.wikipedia.org/wiki/Wolfenstein_3D">Wolfenstein 3D</a> и <a class="link underline" href="https://en.wikipedia.org/wiki/Doom_(1993_video_game)">DOOM</a> от компании <a class="link underline" href="https://en.wikipedia.org/wiki/Id_Software">Id software</a> были псевдо-трехмерными. Разработчики хитрым образом достраивали еще одно измерение на основе двумерной карты и проекции на воображаемый экран камеры. Поэтому вполне очевидно, что разработку необходимио начать с двумерной карты. Для этого нам потребуется ввести некоторые абстракции.
      </p>
      <p class="py-2 text">
        Вершина и отрезок:
      </p>
      <CodeBlock code={code1} lang='ts'/>
      <p class="py-2 text">
        Угол со вспомогательными методами:
      </p>
      <CodeBlock code={code2} lang='ts'/>
      <p class="py-2 text">
        Камеру, которую мы планируем перемещать по карте: 
      </p>
      <CodeBlock code={code3} lang='ts'/>
      <p class="py-2 text">
        Для каждой заметки добавим ее настройки, а именно камеру и набор линий:
      </p>
      <CodeBlock code={code4} lang='ts' />
      <p class="py-2 text">
        Также добавим вспомогательный виджет, который будет показывать камеру, ее угол обзора, уровень как множество линий. Если рядом с картой присутствуют элементы уравления, значит на этой странице можно управлять картой, например, перемещать камеру, приближать объекты на карте и прочее. Этот виджет будет сопровождать большинство заметок. 
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
        Если вы читаете эти заметки с мобильного устройства, то можете смело нажимать на все кнопки рядом с картой, если они здесь, значит они точно работают.
      </p>
    </section>
  );
};

export default Stage;