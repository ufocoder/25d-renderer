import { menuGroups, type MenuLink } from '@app/config/menu';
import { A, useLocation } from '@solidjs/router';
import type { Component } from 'solid-js';
import { createMemo } from 'solid-js';

export const StageNavigation: Component = () => {
  const location = useLocation();

  const allLinks = createMemo(() => {
    const links: (MenuLink & { groupTitle: string })[] = [];
    menuGroups.forEach((group) => {
      if ('links' in group) {
        group.links.forEach(link => {
          links.push({
            ...link,
            groupTitle: group.title
          });
        });
      } else {
        links.push({
          ...group,
          groupTitle: ''
        });
      }
    });
    return links;
  });

  const currentIndex = createMemo(() => {
    const currentPath = location.pathname;
    return allLinks().findIndex(link => link.href === currentPath);
  });

  const prevLink = createMemo(() => {
    const index = currentIndex();
    if (index > 0) {
      return allLinks()[index - 1];
    }
    return null;
  });
  
  const nextLink = createMemo(() => {
    const index = currentIndex();
    if (index >= 0 && index < allLinks().length - 1) {
      return allLinks()[index + 1];
    }
    return null;
  });

  if (currentIndex() === -1) {
    return null;
  }
  
  return (
    <div class="mt-8 pt-6 border-t border-[#d8deea]">
      <div class="flex items-center justify-between gap-4">
        {prevLink() ? (
          <A
            href={prevLink()!.href}
            class="group flex items-center gap-3 py-3 pr-3 text-[#1f2a44] hover:text-blue-800"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <div class="flex flex-col items-start">
              <span class="text-xs">
                {prevLink()!.groupTitle}
              </span>
              <span class="text-sm font-medium">{prevLink()!.label}</span>
            </div>
          </A>
        ) : (
          <div class="invisible" />
        )}
        
        {nextLink() ? (
          <A
            href={nextLink()!.href}
            class="group flex items-center gap-3 py-3 pl-3 text-[#1f2a44] hover:text-blue-800"
          >
            <div class="flex flex-col items-end">
              <span class="text-xs">
                {nextLink()!.groupTitle}
              </span>
              <span class="text-sm font-medium">{nextLink()!.label}</span>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="transition-transform group-hover:translate-x-0.5"
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </A>
        ) : (
          <div class="invisible" />
        )}
      </div>
    </div>
  );
};