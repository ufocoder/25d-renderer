export interface KeyboardControlsProps {
  withVertical?: boolean;
}

export default function KeyboardControls({ withVertical }: KeyboardControlsProps) {
  const handleMouseDown = (key: string) => {
    const keydownEvent = new KeyboardEvent('keydown', {
      key: key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
    });
    
    document.dispatchEvent(keydownEvent);
  };

  const handleMouseUp = (key: string) => {
    const keyupEvent = new KeyboardEvent('keyup', {
      key: key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
    });
    
    document.dispatchEvent(keyupEvent);
  };

  return (
    <p class="my-2 flex flex-wrap items-center justify-center gap-1 font-normal text-gray-500 select-none">
      <span>Управление камерой </span>
      <kbd 
        class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
        onPointerDown={() => handleMouseDown('w')}
        onPointerUp={() => handleMouseUp('w')}
        onContextMenu={(e) => e.preventDefault()}
      >
        W
      </kbd>
      <kbd 
        class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
        onPointerDown={() => handleMouseDown('a')}
        onPointerUp={() => handleMouseUp('a')}
        onContextMenu={(e) => e.preventDefault()}
      >
        A
      </kbd>
      <kbd 
        class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
        onPointerDown={() => handleMouseDown('s')}
        onPointerUp={() => handleMouseUp('s')}
        onContextMenu={(e) => e.preventDefault()}
      >
        S
      </kbd>
      <kbd 
        class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
        onPointerDown={() => handleMouseDown('d')}
        onPointerUp={() => handleMouseUp('d')}
        onContextMenu={(e) => e.preventDefault()}
      >
        D
      </kbd>
      {withVertical && (
        <>
          <span> и </span>
          <kbd 
            class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
            onPointerDown={() => handleMouseDown('z')}
            onPointerUp={() => handleMouseUp('z')}
            onContextMenu={(e) => e.preventDefault()}
          >
            Z
          </kbd>
          <kbd 
            class="p-1.5 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-400 rounded cursor-pointer hover:bg-gray-200 transition-colors select-none"
            onPointerDown={() => handleMouseDown('x')}
            onPointerUp={() => handleMouseUp('x')}
            onContextMenu={(e) => e.preventDefault()}
          >
            X
          </kbd>
        </>
      )}
    </p>
  );
}
