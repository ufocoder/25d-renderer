import { createSignal, onCleanup } from "solid-js";
import KeyboardControls, { type KeyboardControlsProps } from "./Controls";
import Canvas, { type RendererProps } from "./Canvas";

type Map2dProps = KeyboardControlsProps & Pick<RendererProps, 'render' | 'settings' | 'width' | 'height'>;

const MIN_SCALE = 0.125;
const MAX_SCALE = 16;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 320;

export default function Map2d({ withVertical, settings, render, width = CANVAS_WIDTH, height = CANVAS_HEIGHT }: Map2dProps) {
    const [scale, setScale] = createSignal(1);
    const [offsetX, setOffsetX] = createSignal(0);
    const [offsetY, setOffsetY] = createSignal(0);

    let containerRef: HTMLDivElement | null = null;
    const [isPanning, setIsPanning] = createSignal(false);
    const [lastPointerX, setLastPointerX] = createSignal(0);
    const [lastPointerY, setLastPointerY] = createSignal(0);

    const handleZoomIn = () => {
        setScale(prev => {
            const newScale = Math.min(prev * 2, MAX_SCALE);

            const centerX = CANVAS_WIDTH / 2;
            const centerY = CANVAS_HEIGHT / 2;

            const worldX = (centerX - offsetX()) / scale();
            const worldY = (centerY - offsetY()) / scale();

            const newOffsetX = centerX - worldX * newScale;
            const newOffsetY = centerY - worldY * newScale;
            
            setOffsetX(newOffsetX);
            setOffsetY(newOffsetY);
            
            return newScale;
        });
    };

    const handleZoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(prev / 2, MIN_SCALE);
            const centerX = CANVAS_WIDTH / 2;
            const centerY = CANVAS_HEIGHT / 2;
            const worldX = (centerX - offsetX()) / scale();
            const worldY = (centerY - offsetY()) / scale();
            const newOffsetX = centerX - worldX * newScale;
            const newOffsetY = centerY - worldY * newScale;
            
            setOffsetX(newOffsetX);
            setOffsetY(newOffsetY);
            
            return newScale;
        });
    };

    const handlePointerDown = (e: PointerEvent) => {
        if (e.button === 0 || e.pointerType === 'touch') {
            e.preventDefault();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setIsPanning(true);
            setLastPointerX(e.clientX);
            setLastPointerY(e.clientY);
        }
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (isPanning()) {
            e.preventDefault();
            
            const deltaX = e.clientX - lastPointerX();
            const deltaY = e.clientY - lastPointerY();
            
            setOffsetX(prev => prev + deltaX);
            setOffsetY(prev => prev + deltaY);
            
            setLastPointerX(e.clientX);
            setLastPointerY(e.clientY);
        }
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (isPanning()) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            setIsPanning(false);
        }
    };

    const handlePointerCancel = (_: PointerEvent) => {
        setIsPanning(false);
    };

    onCleanup(() => {
        if (containerRef) {
            containerRef.style.touchAction = '';
        }
    });

    return (
        <>
            <div class="flex justify-center items-start gap-2">
                <div 
                    ref={(ref) => { containerRef = ref; }}
                    class="relative"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={{ 
                        cursor: isPanning() ? 'grabbing' : 'grab',
                        'user-select': 'none',
                        'touch-action': 'none'
                    }}
                >
                    <Canvas
                        width={width}
                        height={height}
                        scale={scale}
                        offsetX={offsetX}
                        offsetY={offsetY}
                        settings={settings}
                        render={render}
                        zoomFromCenter={true}
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <button
                        onClick={handleZoomIn}
                        class="p-1.5 py-1 w-8 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
                    >
                        +
                    </button>
                    <button
                        onClick={handleZoomOut}
                        class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
                    >
                        -
                    </button>
                </div>
            </div>
            <div class="flex justify-center mt-2">
                <KeyboardControls withVertical={withVertical} />
            </div>
            <div class="text-center text-xs text-gray-500 mt-1">
                Offset: ({offsetX().toFixed(0)}, {offsetY().toFixed(0)}) | Scale: {scale().toFixed(2)}x
            </div>
        </>
    );
}