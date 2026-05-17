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

    createEffect(() => {
        const currentPath = location.pathname;
        let newHeader: null | Header = null;

        for (const group of menuGroups) {
            if (isMenuGroup(group)) {
                const foundLink = group.links.find(link => link.href === currentPath);
                if (foundLink) {
                    newHeader = {
                        title: group.title,
                        label: foundLink.label,
                        isLink: true
                    };
                }
            } else {
                if (group.href === currentPath) {
                    newHeader = {
                        title: group.label,
                        label: null,
                        isLink: false
                    };
                    break;
                }
            }
        }
        setCurrentHeader(newHeader)            
    });

    return (
        <>
            {currentHeader() ? (
                <div class="mb-6 pb-3 border-b border-[#d8deea]">
                    {currentHeader()!.isLink ? (
                        <>
                            <p class="text-sm text-[#6b7a8f] mb-1">{currentHeader()!.title}</p>
                            <h2 class="text-3xl font-semibold text-[#1f2a44]">{currentHeader()!.label}</h2>
                        </>
                    ) : (
                        <h2 class="text-3xl font-semibold text-[#1f2a44]">{currentHeader()!.title}</h2>
                    )}
                </div>
            ) : null}
        </>
    );
}