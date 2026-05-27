import CodeBlock from '@app/components/Code';
import type { Component } from 'solid-js';

const code1 = `
  interface Color {
    r: number
    g: number
    b: number
  }

`;
const code2 = `
  type Texture = {
    width: number;
    height: number;
    bitmap: number[][];
    colors: Color[];
    scale: number;
  }

`;

const code3 = `
  const textures: Record<string, Texture> = {
    ceil: {
      scale: 4,
      width: 4,
      height: 4,
      bitmap: [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
      ],
      colors: [
        { r: 70, g: 70, b: 70 },
        { r: 50, g: 50, b: 50 },
      ],
    },
    floor: {
      scale: 2,
      width: 4,
      height: 4,
      bitmap: [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [1, 1, 0, 0],
        [1, 1, 0, 0],
      ],
      colors: [
        { r: 120, g: 120, b: 120 },
        { r: 90, g: 90, b: 90 },
      ],
    },
    wall: {
      scale: 1,
      width: 8,
      height: 8,
      bitmap: [
        [0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0],
      ],
      colors: [
        { r: 120, g: 200, b: 120 },
        { r: 200, g: 100, b: 100 },
      ],
    },
  };

`;

const Stage: Component = () => {
  return (
    <section class="flex flex-col gap-4">
      <p class="py-2">
        В прошлом мы получили уровни состоящие из однотонных стен, пола и потолков, однако в настоящих игрых мы привыкли встречать разнообразные локации, например: лаборатории, пещеры или подземелье или что-то еще. А чтобы создать что-то подобное, необходимо реализовать текстурирование.
      </p>
      <p class="py-2">
        Все цвета будем описывать не в виде строк, а в виде набора трех цветов:
      </p>
      <CodeBlock code={code1} lang='ts'/>
      <p class="py-2">
        Теперь зададим описание самой текстуры д
      </p>
      <CodeBlock code={code2} lang='ts'/>
      <p class="py-2">
        Затем определим текстуры для будущего оформления стен, пола и потолка:
      </p>
      <CodeBlock code={code3} lang='ts'/>
      <p class="py-2">
        В будущем можно будет загружать необходимые изображения и с легкостью представлить их в виде таких же bitmap как выше.
      </p>
    </section>
  );
};

export default Stage;