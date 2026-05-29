import type { Component } from 'solid-js';
import CodeBlock from "@app/components/Code";


const code1 = `
  interface Seg {
    // ..
    frontSector: Sector;
    backSector: Sector;
    isTwoSide: boolean;
  }

  function isPortal(seg: Seg): boolean {
    return Boolean(seg.isTwoSide && seg.backSector && seg.backSector !== seg.frontSector);
  }

`;

const Stage: Component = () => {
  return (
    <section class="flex flex-col gap-4">

      <p class="my-2">
        Расширяем понимание сегмента. Пусть теперь будут встречаться и такие, которые мы не закрашиваем, но через которые будет рисоваться оставшийся уровень. Назовем такие стены — порталами.
      </p>

      <p>
        Сегменты, образующие порталы, будем помечать флагом и хранить в нем информацию о том, какие сектора они соединяют:
      </p>

      <CodeBlock code={code1} lang="ts" />

      <p>
        Затем мы рекурсивно обрабатываем сектор за сектором, в которых перебираем сегменты и формируем проекции с учетом знаний о портале
      </p>

    </section>
  );
};

export default Stage;
