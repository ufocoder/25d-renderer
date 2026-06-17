import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import { useAnimationValue } from '@app/hooks/useAnimationValue';
import { useCameraControls } from '@app/hooks/useCameraControls';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import render25d from '@app/stages/Stage2j/render25d';
import defaultSettings from '@app/stages/Stage2k/settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  const { percent, startAnimation, stopAnimation } = useAnimationValue({ duration: 2_000, loop: true });

  createEffect(() => {
    const z = 10_000 * percent();
    setSettings(prevSettings => ({
      ...prevSettings,
      camera: {
        ...prevSettings.camera,
        z
      }
    }))
  })

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2.5D Renderer</h2>
          <div class="flex justify-center">
            <Canvas
        settings={settings}
        width={settings().camera.screen.width}
        height={settings().camera.screen.height}
        render={render25d}
      />
          </div>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              class="border border-[#9eb3da] bg-[#dce6fa] px-4 py-2 text-sm font-medium text-[#1f2a44] transition-colors hover:bg-[#c8d8f5]"
              onClick={() => startAnimation()}
            >
              play camera Z axis animation
            </button>
            <button
              type="button"
              class="border border-[#9eb3da] bg-[#dce6fa] px-4 py-2 text-sm font-medium text-[#1f2a44] transition-colors hover:bg-[#c8d8f5]"
              onClick={() => stopAnimation()}
            >
              stop camera Z axis animation
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="flex justify-center text-2xl">2D Renderer</h2>
          <div class="flex justify-center">
            <Map2d
        withControls
        width={400}
        height={320}
        settings={settings}
        render={render2d}
                  />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stage;
