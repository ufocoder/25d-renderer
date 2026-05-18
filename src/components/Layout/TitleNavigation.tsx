import { useLocation } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { menuGroups, isMenuGroup } from '@app/config/menu';

interface Header {
    title: string;
    label: string | null;
    isLink: boolean;
}

export function TitleNavigation() {
    const location = useLocation();
    const [currentHeader, setCurrentHeader] = createSignal<null | Header>(null);
    const [nextStagePath, setNextStagePath] = createSignal<string | null>(null);

    createEffect(() => {
        const currentPath = location.pathname;
        let newHeader: null | Header = null;
        let nextPath: string | null = null;

        let foundCurrent = false;
        
        for (let g = 0; g < menuGroups.length; g++) {
            const group = menuGroups[g];
            
            if (isMenuGroup(group)) {
                for (let i = 0; i < group.links.length; i++) {
                    const link = group.links[i];
                    if (link.href === currentPath) {
                        newHeader = {
                            title: group.title,
                            label: link.label,
                            isLink: true
                        };
                        foundCurrent = true;
                        
                        // Поиск следующего stage
                        // Сначала проверяем следующий пункт в текущей группе
                        if (i + 1 < group.links.length) {
                            nextPath = group.links[i + 1].href;
                        } else {
                            // Если это последний пункт в группе, ищем первую ссылку в следующей группе
                            for (let nextGroup = g + 1; nextGroup < menuGroups.length; nextGroup++) {
                                const nextGroupItem = menuGroups[nextGroup];
                                if (isMenuGroup(nextGroupItem) && nextGroupItem.links.length > 0) {
                                    nextPath = nextGroupItem.links[0].href;
                                    break;
                                } else if (!isMenuGroup(nextGroupItem) && nextGroupItem.href) {
                                    nextPath = nextGroupItem.href;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            } else {
                if (group.href === currentPath) {
                    newHeader = {
                        title: group.label,
                        label: null,
                        isLink: false
                    };
                    foundCurrent = true;
                    
                    // Поиск следующего stage после одиночного пункта
                    for (let nextGroup = g + 1; nextGroup < menuGroups.length; nextGroup++) {
                        const nextGroupItem = menuGroups[nextGroup];
                        if (isMenuGroup(nextGroupItem) && nextGroupItem.links.length > 0) {
                            nextPath = nextGroupItem.links[0].href;
                            break;
                        } else if (!isMenuGroup(nextGroupItem) && nextGroupItem.href) {
                            nextPath = nextGroupItem.href;
                            break;
                        }
                    }
                    break;
                }
            }
            if (foundCurrent) break;
        }
        
        setCurrentHeader(newHeader);
        setNextStagePath(nextPath);
    });

    return (
        <>
            {currentHeader() ? (
                <div class="mb-6 pb-3 border-b border-[#d8deea] relative">
                    <div class="flex justify-between items-center">
                        <div>
                            {currentHeader()!.isLink ? (
                                <>
                                    <p class="text-sm text-[#6b7a8f] mb-1">{currentHeader()!.title}</p>
                                    <h2 class="text-3xl font-semibold text-[#1f2a44]">{currentHeader()!.label}</h2>
                                </>
                            ) : (
                                <h2 class="text-3xl font-semibold text-[#1f2a44]">{currentHeader()!.title}</h2>
                            )}
                        </div>
                        
                        {nextStagePath() && (
                            <div class="text-right">
                                <a 
                                    href={nextStagePath()!} 
                                    class="text-2xl text-[#6b7a8f] hover:text-[#1f2a44] transition-colors inline-flex items-center justify-center w-10 h-10 hover:translate-x-0.5 transition-transform"
                                    aria-label="Следующий этап"
                                >
                                    →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </>
    );
}