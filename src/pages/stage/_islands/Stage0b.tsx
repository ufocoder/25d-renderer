import Map2d from '@app/components/Map2d';
import { useCameraControls } from '@app/hooks/useCameraControls';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render2d from '@app/stages/Stage0b/render2d';
import defaultSettings from '@app/stages/Stage0b/settings';

const Stage: Component = () => {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings);

  useCameraControls<Settings>({ settings, setSettings });

  return (
    <Map2d
      withZoom
      withDebug
      withControls
      width={settings().camera.screen.width}
      height={settings().camera.screen.height}
      settings={settings}
      render={render2d}
    />
  );
};

export default Stage;
