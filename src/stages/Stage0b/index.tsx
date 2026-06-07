import CodeBlock from '@app/components/Code';
import Map2d from '@app/components/Map2d';
import { useCameraControls } from '@app/hooks/useCameraControls';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from './render2d';
import defaultSettings from './settings';
import RepoLink from '@app/components/RepoLink';
import Label from '@app/components/Label';

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
        Если вы вдруг не знали или забыли, то ранние шутеры <a class="link underline" href="https://en.wikipedia.org/wiki/Wolfenstein_3D">Wolfenstein 3D</a> и <a class="link underline" href="https://en.wikipedia.org/wiki/Doom_(1993_video_game)">DOOM</a> от компании <a class="link underline" href="https://en.wikipedia.org/wiki/Id_Software">Id software</a> были псевдо-трехмерными. Разработчики особым образом достраивали еще одно измерение на основе двумерной карты и проекции на воображаемый экран камеры. Поэтому вполне очевидно, что разработку отрисовщика необходимио начать с реализации двумерной карты. Для этого нам потребуется ввести некоторые абстракции. 
      </p>
      <p class="py-2 text">  
        Введем такие сущности как <Label>Vertex</Label> (Вершина) и <Label>Linedef</Label> (Отрезок):
      </p>
      <CodeBlock code={code1} lang='ts'/>
      <p class="py-2 text">
        Для работы с углами опишем класс <Label>Angle</Label> со вспомогательными методами:
      </p>
      <CodeBlock code={code2} lang='ts'/>
      <p class="py-2 text">
        Опишем камеру, которую мы планируем перемещать по карте и на которую будет проекцировать будущее изображение: 
      </p>
      <CodeBlock code={code3} lang='ts'/>
      <p class="py-2 text">
        Для каждого отрисовщика, а на странице их может быть несколько, добавим его настройки:
      </p>
      <CodeBlock code={code4} lang='ts' />
      <p class="py-2 text">
        Теперь добавим вспомогательный виджет, который будет показывать для карты сверху камеру, ее угол обзора и уровень как множество линий. Если рядом с картой будут присутствовать элементы уравления, значит на этой странице можно управлять картой, например, перемещать камеру, приближать объекты на карте и прочее. Этот виджет будет сопровождать большинство заметок.
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
        Кстати, если вы читаете эти заметки с мобильного устройства, то можете смело нажимать на все кнопки рядом с картой, если они есть рядом с картой, значит они точно должны работать.
      </p>
      <p class="my-2">
        <RepoLink filePath="stages/Stage0b/render25d.ts">Реализация шага на github</RepoLink>
      </p>
    </section>
  );
};

export default Stage;