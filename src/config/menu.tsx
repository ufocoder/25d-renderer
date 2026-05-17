export type MenuLink = {
  href: string;
  label: string;
};

export type MenuGroup = {
  title: string;
  links: MenuLink[];
};

export type MenuEntry = MenuGroup | MenuLink;

export function isMenuGroup(entry: MenuEntry): entry is MenuGroup {
  return 'links' in entry;
}

export function linkClass(active: boolean) {
  return `block rounded-lg border px-3 py-2 text-sm no-underline transition-colors ${
    active
      ? 'border-[#9eb3da] bg-[#dce6fa] text-[#1f2a44]'
      : 'border-transparent text-[#4a5a75] hover:border-[#c3d0ea] hover:bg-[#e3ebfa]'
  }`;
}

export function isPathActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href;
}

export const menuGroups: MenuEntry[] = [
  { href: '/', label: 'Предисловие' },
  { 
    title: 'Stage 0: Введение',
    links: [
      { href: '/stage-0a', label: 'Двумерная карта' },
      { href: '/stage-0b', label: 'Почему (не) WAD файл' },
    ]
  },
  {
    title: 'Stage 1: Отрисовка стен',
    links: [
      { href: '/stage-1a', label: 'Проекция вершин' },
      { href: '/stage-1b', label: 'Проекция стены' },
      { href: '/stage-1c', label: 'Проблема Fish eye' },
      { href: '/stage-1d1', label: 'Отсечение стены #1: ряд стен' },
      { href: '/stage-1d2', label: 'Отсечение стены #2: корридор' },
      { href: '/stage-1d3', label: 'Отсечение стены #3: окружность' },
      { href: '/stage-1e', label: 'Сортировки стен' },
      { href: '/stage-1f', label: 'Разделение стен' },
    ],
  },
  {
    title: 'Stage 2: Отрисовка секторов',
    links: [
      { href: '/stage-2a', label: 'Уровень из секторов' },
      { href: '/stage-2b', label: 'Разные высоты у секторов' },
      { href: '/stage-2c', label: 'Нормализация высот секторов' },
      { href: '/stage-2d', label: 'Пол и потолок: сектор' },
      { href: '/stage-2e', label: 'Соседний сектор' },
      { href: '/stage-2f', label: 'Порталы 1D: соединяем сектора' },
      { href: '/stage-2g', label: 'Порталы 2D: прямоугольник' },
      { href: '/stage-2h', label: 'Высота камеры' },
      { href: '/stage-2i', label: 'Порталы 2D: трапеция' },
      { href: '/stage-2j', label: 'Порталы 2D: многоугольник' },
    ],
  },
  {
    title: 'Stage 3: Binary Space Partition',
    links: [
      { href: '/stage-3a', label: 'Разбитие на подсектора' },
      { href: '/stage-3b', label: 'Тест: варианты разбития' },
      { href: '/stage-3c', label: 'Один сектор с геометрией' },
      { href: '/stage-3d', label: 'Порталы 1D: соединяем сектора' },
      { href: '/stage-3e', label: 'Порталы 2D: соединяем сектора' },
      { href: '/stage-3f', label: 'Высота камеры' },
      { href: '/stage-3g', label: 'Разные высоты секторов' },
    ],
  },
  {
    title: 'Stage 4: Улучшаем движение',
    links: [
      { href: '/stage-4a', label: 'перемещение по лестницам' },
      { href: '/stage-4b', label: 'коллизиции со стенами' },
      { href: '/stage-4с', label: 'покачивание камеры' },
    ],
  },
  {
    title: 'Stage 5: Текстурирование',
    links: [
      { href: '/stage-5a', label: 'стены' },
      { href: '/stage-5b', label: 'пол и потолок' },
      { href: '/stage-5c', label: 'уровень освещения' },
    ],
  },
  {
    title: 'Stage 6: Прочее',
    links: [
      { href: '/stage-6a', label: 'предметы' },
    ],
  }
];