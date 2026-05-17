import CodeBlock from '@app/components/Code';
import type { Component } from 'solid-js';

const code1 = `
  interface Vertex {
    x: number;
    y: number;
  }

  interface Sidedef {
    xOffset: number;
    yOffset: number;
    upperTexture: string;
    lowerTexture: string;
    middleTexture: string;
    sector?: Sector;
  }

  interface Linedef {
    startVertex: Vertex;
    endVertex: Vertex;
    flags: number;
    lineType: number;
    sectorTag: number;
    rightSidedef?: Sidedef;
    leftSidedef?: Sidedef;
  }

  interface Seg {
    startVertex: Vertex;
    endVertex: Vertex;
    slopeAngle: Angle;
    linedef: Linedef;
    direction: number;
    offset: number;
    rightSector?: Sector;
    leftSector?: Sector;
  }

  interface BSPNode {
    x: number;
    y: number;
    changeX: number;
    changeY: number;

    rightBoxTop: number;
    rightBoxBottom: number;
    rightBoxLeft: number;
    rightBoxRight: number;

    leftBoxTop: number;
    leftBoxBottom: number;
    leftBoxLeft: number;
    leftBoxRight: number;

    rightChildID: number;
    leftChildID: number;
  }

  interface Sector {
    floorHeight: number;
    floorTexture: string;
    ceilingHeight: number;
    ceilingTexture: string;
    lightlevel: number;
    type: number;
    tag: number;
  }

`;

const Stage: Component = () => {
  return (
    <section class="flex flex-col gap-4">
      <p class="py-2">
        Потому что 

        Уровни в DOOM описываются с помощью <a class="link underline" href="https://doom.fandom.com/wiki/WAD" target="_blank">WAD файлов</a>. 
        Если попытаться представить часть сущностей, которые описываются в WAD файле, то можно описать следующие TypeScript интерфейсы:
        


      </p>
      <CodeBlock code={code1} lang='ts'/>
    </section>
  );
};

export default Stage;