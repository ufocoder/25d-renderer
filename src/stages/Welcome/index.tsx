import type { Component } from 'solid-js';
import imageGameSrc from './assets/wolf3d-like.png'
import imageDemoSrc from './assets/raycasting.png'

const Stage: Component = () => {
  return (
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl">Wolfenstein 3D-like отрисовщик</h2>
      <p class="py-2">
        В прошлом я хотел ближе познакомится с компьютерной графикой и одновременно с этим уже что-то создать. Погружаться в мир шейдеров оказалось не таким интересным занятием, нельзя было получить быстрый результат, сорвать низковесящий фрукт, поэтому я отложил изучение шейдеров в долгий ящик и решил найти для себя иной подход. На глаза попадались статьи про такую технику отрисовки как <a class="link underline" href="https://en.wikipedia.org/wiki/Ray_casting">Raycasting</a>. Техника оказалась посильной, если вы немного помните курс школьной геометрии и умеете программировать. Достаточно потратить несколько выходных, чтобы создать свой мир в виде лабиринта.
      </p>
      <p class="py-2">
        Изучив эту технику ее, я <a class="link underline" href="https://github.com/ufocoder/fps">реализовал</a> браузерную игру похожую на продвинутую версию <a class="link underline"  href="https://en.wikipedia.org/wiki/Wolfenstein_3D">Wolfenstein 3D</a> с использованием паттерна <a class="link underline" href="https://en.wikipedia.org/wiki/Entity_component_system">Entity-Component-System</a> (плюс спасибо ребятам за <a class="link underline" href="https://github.com/ufocoder/fps/pull/36">систему подсветки</a> и <a class="link underline" href="https://github.com/ufocoder/fps/pull/27">открытия дверей</a>). Однако многие, кто не знаком с отрисовщиками прошлого, скажут что видели что-то похожее в DOOM, правда, к сожалению это не он. И кстати, некоторые разработчики не стесняются этим пользоваться, например, проект <a class="link underline" href="https://github.com/cedardb/DOOMQL" target="_blank">DOOMQL</a> под капотом содержит wolf3d-like отрисовщик.
      </p>
      <img src={imageGameSrc} class="max-w-100" />
      <p>
        Чтобы передать другим свой опыт изучения raycasting, я реализовал отдельное <a class="link underline" href="https://ufocoder.github.io/raycasting-demo/" target="_blank">raycasting demo</a>, где любой может поизучать как заданные параметры отрисовки влияют на конечный результат:
      </p>
      <img src={imageDemoSrc} class="max-w-100" />
      <h2 class="text-2xl">DOOM-like отрисовщик</h2>
      <p class="py-2">
        Весь этот проект — это моя попытка с нуля воссоздать рендер похожий на тот, каким он был сделан в <a class="link underline" href="https://en.wikipedia.org/wiki/Doom_(1993_video_game)" target="_blank">DOOM 1993</a> и оставить после себя артефакт, объясняющий другим как все работает под капотом. Конечно, уже существуют такие проекты, как, например, <a class="link underline" href="https://github.com/amroibrahim/DIYDoom/tree/master" target="_blank">репозиторий DIYDoom</a> или такая замечательная книга, как <a class="link underline" href="https://fabiensanglard.net/gebbdoom/index.html" target="_blank"> Game Engine Black Book DOOM</a>. И пусть в них описывают некоторые основные идеи и даже показываются реализации, но они не раскрывают суть, почему в прошлом было сделано именно так или иначе.
      </p>
      <p class="py-2">
        С одной стороны, мне хотелось столкнуться со сложностями отрисовки из прошлого, чтобы сравнить мои первые наивные идеи с тем, как это по итогу было сделано в DOOM. С другой стороны, только проделав путь самому, можно попытаться объяснить почему в прошлом были сделаны именно такие шаги. И именно благодаря попытке воссоздать все с нуля у меня появилась интуиция зачем был необходим алгоритм <a class="link underline" href="https://en.wikipedia.org/wiki/Binary_space_partitioning" target="_blank">Binary space partitioning</a>. Не знаю какие изначально были мысли у Джона Кармака, но когда вы доберетесь до раздела священному BSP и столкнетесь с проблемой которую предстоит сделать, то введение этого алгоритма будет  чертовски уместным.
      </p>
      <p class="py-2">
        То, что повествуется на этом ресурсе — это не пошаговая реализация отрисовщика DOOM, это использование идей из DOOM, поэтому финальный результат может отличаться от оригинала. Здесь я иду своим путем, опираясь на свой и чужой опыт. Например, также как и в прошлом я сделаю все вычисления геометрии и текстур на CPU, также как и в прошлом я использую понятия секторов и порталов. 
      </p>
      <p class="py-2">
        Если вы найдете опечатки или у вас будут предложения по улучшению этого проекта, не стесняйтесь создавать <a class="link underline" href="https://github.com/ufocoder/25d-renderer/issues/new" target="_blank">issues на github</a>.
      </p>
    </section>
  );
};

export default Stage;