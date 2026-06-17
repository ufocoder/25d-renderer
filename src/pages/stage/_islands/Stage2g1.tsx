import Canvas from "@app/components/Canvas/CanvasBase";
import Map2d from '@app/components/Map2d';
import StepProgressButton from '@app/pages/stage/_components/StepProgressButton';
import render2d from '@app/stages/Stage0b/render2d';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import render25d, { type Stage2g1Animation } from '@app/stages/Stage2g1/render25d';
import defaultSettings from '@app/stages/Stage2g1/settings';

interface StageProps {
  part?: number;
}

type Stage2g1Settings = Settings & {
  animation: Stage2g1Animation;
};

const Stage: Component<StageProps> = (props) => {
  let runId = 0;
  let nextStep: (() => void) | null = null;
  const [isAutoPlaying, setIsAutoPlaying] = createSignal(false);
  const [progressStep, setProgressStep] = createSignal(0);

  const handleAnimationStep = () => {
    setProgressStep((step) => step + 1);
  };

  const handleAnimationComplete = () => {
    setIsAutoPlaying(false);
  };

  const [settings, setSettings] = createSignal<Stage2g1Settings>({
    ...defaultSettings,
    animation: {
      delay: 1_000,
      isActive: (id) => id === runId,
      mode: 'step',
      onComplete: handleAnimationComplete,
      onStepStart: handleAnimationStep,
      runId,
      waitForNextStep: () =>
        new Promise<void>((resolve) => {
          nextStep = resolve;
        }),
    },
  });

  const resolveNextStep = () => {
    nextStep?.();
    nextStep = null;
  };

  const updateAnimation = (mode: Stage2g1Animation['mode']) => {
    resolveNextStep();
    runId += 1;
    setIsAutoPlaying(mode === 'auto');
    setProgressStep(0);

    setSettings((prevSettings) => ({
      ...prevSettings,
      animation: {
        delay: 1_000,
        isActive: (id) => id === runId,
        mode,
        onComplete: handleAnimationComplete,
        onStepStart: handleAnimationStep,
        runId,
        waitForNextStep: () =>
          new Promise<void>((resolve) => {
            nextStep = resolve;
          }),
      },
    }));
  };

  const playFullAnimation = () => {
    updateAnimation('auto');
  };

  const playNextStep = () => {
    if (settings().animation.mode === 'step' && nextStep) {
      resolveNextStep();
      return;
    }

    updateAnimation('step');
  };

  const renderPart = (part: number) => {
    switch (part) {
      case 0:
        return (
          <>
            <div class="flex flex-col justify-center gap-6 md:grid md:grid-cols-2 md:gap-4 md:items-start justify-items">
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  2.5D Renderer
                </h2>
                <div class="flex justify-center">
                  <Canvas
                    settings={settings}
                    width={settings().camera.screen.width}
                    height={settings().camera.screen.height}
                    render={render25d}
                  />
                </div>
                <div class="flex flex-wrap justify-center gap-2">
                  <StepProgressButton
                    active={isAutoPlaying()}
                    duration={settings().animation.delay}
                    onClick={playFullAnimation}
                    step={progressStep()}
                  >
                    Запустить всю анимацию
                  </StepProgressButton>
                  <button
                    type="button"
                    class="border border-[#9eb3da] bg-[#dce6fa] px-4 py-2 text-sm font-medium text-[#1f2a44] transition-colors hover:bg-[#c8d8f5]"
                    onClick={playNextStep}
                  >
                    Следующий шаг
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <h2 class="flex justify-center text-2xl">
                  2D Renderer
                </h2>
                <div class="flex justify-center">
                  <Map2d
                    width={400}
                    height={320}
                    settings={settings}
                    render={render2d}
                  />
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div class="flex flex-col gap-4">
      {renderPart(props.part ?? 0)}
    </div>
  );
};

export default Stage;
