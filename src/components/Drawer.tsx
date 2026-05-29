import { A, useLocation } from '@solidjs/router';
import type { Component } from 'solid-js';
import { createEffect, onCleanup, createSignal, createMemo } from 'solid-js';
import { menuGroups, isMenuGroup, linkClass, isPathActive } from '../config/menu';

const MenuGroup: Component<{
  title: string;
  links: Array<{ href: string; label: string }>;
  currentPath: string;
  isExpanded: boolean;
  onToggle: () => void;
  onLinkClick?: () => void;
}> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);

  return (
    <div class="flex min-w-0 flex-col gap-1">
      <button
        onClick={props.onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        class={`group flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wide select-none transition-all duration-200 rounded-md px-3 py-3 ${
          isHovered()
            ? 'text-[#1f2a44] bg-[#d8deea]'
            : 'text-[#6b7a8f]'
        }`}
      >
        <span class="text-left flex-1">{props.title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={`transition-all duration-200 ${
            props.isExpanded ? 'rotate-180' : ''
          } ${
            isHovered() ? 'text-[#1f2a44]' : 'text-[#6b7a8f]'
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      
      <div
        class={`overflow-hidden transition-all duration-200 ${
          props.isExpanded ? 'opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul class="m-0 list-none space-y-0.5 pl-0">
          {props.links.map((link) => (
            <li>
              <A
                href={link.href}
                class={linkClass(
                  isPathActive(props.currentPath, link.href),
                )}
                onClick={props.onLinkClick}
              >
                {link.label}
              </A>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const DrawerContent: Component<{ onLinkClick?: () => void }> = (props) => {
  const location = useLocation();
  const [activeGroupTitle, setActiveGroupTitle] = createSignal<string | null>(null);

  const currentActiveGroup = createMemo(() => {
    const currentPath = location.pathname;
    
    for (const entry of menuGroups) {
      if (isMenuGroup(entry)) {
        const hasActiveLink = entry.links.some(link => 
          isPathActive(currentPath, link.href)
        );
        if (hasActiveLink) {
          return entry.title;
        }
      }
    }
    return null;
  });

  createEffect(() => {
    const group = currentActiveGroup();
    if (group) {
      setActiveGroupTitle(group);
    }
  });

  const toggleGroup = (groupTitle: string) => {
    setActiveGroupTitle(prev => prev === groupTitle ? null : groupTitle);
  };

  const isGroupExpanded = (groupTitle: string) => {
    return activeGroupTitle() === groupTitle;
  };

  return (
    <div class="flex flex-col gap-4">
      {menuGroups.map((entry) =>
        isMenuGroup(entry) ? (
          <MenuGroup
            title={entry.title}
            links={entry.links}
            currentPath={location.pathname}
            isExpanded={isGroupExpanded(entry.title)}
            onToggle={() => toggleGroup(entry.title)}
            onLinkClick={props.onLinkClick}
          />
        ) : (
          <A
            href={entry.href}
            class={linkClass(isPathActive(location.pathname, entry.href))}
            onClick={props.onLinkClick}
          >
            {entry.label}
          </A>
        ),
      )}
    </div>
  );
};

export const Drawer: Component<{ isOpen: boolean; onClose: () => void }> = (props) => {
  createEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    onCleanup(() => {
      document.body.style.overflow = '';
    });
  });

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.isOpen) {
        props.onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <div
      class={`fixed inset-0 z-50 transition-all duration-300 ${
        props.isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        class={`absolute inset-0 bg-black transition-opacity duration-300 ${
          props.isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={props.onClose}
      />
      
      <aside
        class={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] transform bg-[#eef2fb] shadow-2xl transition-transform duration-300 ease-out ${
          props.isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div class="flex items-center justify-between border-b border-[#d8deea] px-4 py-4">
          <span class="text-lg font-bold text-[#1f2a44]">2.5D Renderer</span>
          <button
            aria-label="Закрыть меню"
            class="rounded p-1.5 text-[#1f2a44] transition-colors hover:bg-[#d8deea]"
            onClick={props.onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="flex flex-col gap-5 overflow-y-auto p-4" style="max-height: calc(100vh - 60px);">
          <DrawerContent onLinkClick={props.onClose} />
        </div>
      </aside>
    </div>
  );
};