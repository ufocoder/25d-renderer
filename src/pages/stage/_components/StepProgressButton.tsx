import type { Component, JSX } from 'solid-js';
import { createEffect, createSignal, onCleanup } from 'solid-js';

interface StepProgressButtonProps {
  active: boolean;
  children: JSX.Element;
  duration: number;
  onClick: () => void;
  step: number;
}

const StepProgressButton: Component<StepProgressButtonProps> = (props) => {
  const [filled, setFilled] = createSignal(false);
  let frameId: number | undefined;

  createEffect(() => {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
    }

    setFilled(false);

    if (props.active && props.step > 0) {
      frameId = requestAnimationFrame(() => {
        setFilled(true);
      });
    }
  });

  onCleanup(() => {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
    }
  });

  return (
    <button
      type="button"
      class="relative overflow-hidden border border-[#9eb3da] bg-[#dce6fa] px-4 py-2 text-sm font-medium text-[#1f2a44] transition-colors hover:bg-[#c8d8f5]"
      onClick={props.onClick}
    >
      <span
        aria-hidden="true"
        class="absolute inset-y-0 left-0 bg-[#9eb3da]"
        style={{
          transition: filled()
            ? `width ${props.duration}ms linear`
            : 'none',
          width: filled() ? '100%' : '0%',
        }}
      />
      <span class="relative">{props.children}</span>
    </button>
  );
};

export default StepProgressButton;
