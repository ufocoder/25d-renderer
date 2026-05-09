import type { Component } from 'solid-js';
import imageGameSrc from './assets/wolf3d-like.png'
import imageDemoSrc from './assets/raycasting.png'

const Stage: Component = () => {
  return (
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl">Предисловие</h2>
      <p>
        В прошлом я хотел ближе познакомится с компьютерной графикой и одновременно с этим уже что-то создать. Погружаться в мир шейдеров оказалось не таким интересным занятием, нельзя было сорвать низковесящий фрукт, поэтому я отложил все это в долгий ящик и решил найти для себя иной подход. 
      </p>
      <p>
        На глаза попадались статьи про такую технику отрисовки как <a class="link underline" href="https://en.wikipedia.org/wiki/Ray_casting">Raycasting</a>. Изучив эту технику ее, я <a class="link underline" href="https://github.com/ufocoder/fps">реализовал</a> браузерную игру похожую на продвинутую версию <a class="link underline"  href="https://en.wikipedia.org/wiki/Wolfenstein_3D">wolfenstein 3d</a> с использованием паттерна <a class="link underline" href="https://en.wikipedia.org/wiki/Entity_component_system">Entity-Component-System</a> (плюс спасибо ребятам за <a class="link underline" href="https://github.com/ufocoder/fps/pull/36">систему подсветки</a> и <a class="link underline" href="https://github.com/ufocoder/fps/pull/27">открытия дверей</a>). 
      </p>
      <img src={imageGameSrc} class="max-w-100" />
      <p>
        Также для изучения особенностей отрисовки через Raycasting реализовал отдельное <a class="link underline" href="https://ufocoder.github.io/raycasting-demo/">raycasting demo</a>, где любой может поизучать как заданные параметры влияют на конечный результат отрисовки.
      </p>
      <img src={imageDemoSrc} class="max-w-100" />
      <h2 class="text-2xl">DOOM-like отрисовщик</h2>
      <p class="py-2">
        Весь этот проект — это моя попытка с нуля воссоздать рендер похожий на тот, каким он был сделан в <a class="link underline" href="https://en.wikipedia.org/wiki/Doom_(1993_video_game)" target="_blank">DOOM 1993</a> и оставить после себя еще один артефакт, объясняющий другим как все работает. Конечно, уже существуют такие проекты, как например, <a class="link underline" href="https://github.com/amroibrahim/DIYDoom/tree/master">репозиторий DIYDoom</a> или такая замечательная книга, как <a class="link underline" href="https://fabiensanglard.net/gebbdoom/index.html"> Game Engine Black Book DOOM</a>. И пусть в них описывают некоторые основные идеи и даже показываются реализации, но они не раскрывают, почему в прошлом было сделано именно так или иначе. Игры прошлого превосходно оптимизированны — посколькоу все вычисления геометрии и текстур происходили на CPU. Возможности аппаратного обеспечения были ограничены и приходилось искать эффективные приемы и алгоритмы. В результат оригинальный исходный код может показать переусложненным, посколько в нем наслаивается одновременно несколько идей.
      </p>
      <p class="py-2">
        Мне хочется самому столкнуться со сложностями отрисовки из прошлого, сравнить мои первые наивные идеи с тем, как это было сделано в DOOM и объяснить почему был выбран именно такой путь. То, что повествуется на этом ресурсе — это не пошаговая реализация отрисовщика DOOM, это использование идей из DOOM, поэтому финальный результат может отличаться от оригинала. Здесь я иду своим путем, опираясь на свой и чужой опыт.
      </p>
    </section>
  );
};

export default Stage;