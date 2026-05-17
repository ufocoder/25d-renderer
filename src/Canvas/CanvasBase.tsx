import { type Accessor, type Component, createEffect, onMount } from "solid-js";

export interface RendererProps {
  render: (ctx: CanvasRenderingContext2D, settings: Settings, ...rest: any) => void | Promise<void>;
  settings: Accessor<Settings>;
  width?: number;
  height?: number;
  className?: string;
}

const Renderer: Component<RendererProps> = ({
  className = '',
  width = 400,
  height = 320,
  render,
  settings,
}) => {
  let refContainer: HTMLCanvasElement | undefined;

  const tick = async () => {
    const el = refContainer;
    if (!el) {
      return;
    }

    const ctx = el.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.save();
    ctx.clearRect(0, 0, el.width, el.height);

    await render(ctx, settings());
  };

  onMount(() => {
    tick();
  });

  createEffect(() => {
    tick();
  });

  return (
    <canvas
      ref={(canvas) => {
        refContainer = canvas;
      }}
      width={width}
      height={height}
      class={`border border-gray-300 ${className}`}
    />
  );
};

export default Renderer;
