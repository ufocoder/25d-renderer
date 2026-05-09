import {
  type Component,
  type Accessor,
  onMount,
  createEffect,
} from "solid-js";


type Render = (
  ctx: CanvasRenderingContext2D,
  settings: Settings,
  scale: number,
  offsetX: number,
  offsetY: number
) => void;

export interface RendererProps {
  render: Render;
  settings: Accessor<Settings>;
  scale: Accessor<number>;
  offsetX: Accessor<number>;
  offsetY: Accessor<number>;
  width?: number;
  height?: number;
  class?: string;
  zoomFromCenter?: boolean;
}

const Renderer: Component<RendererProps> = ({ 
  scale, 
  width = 400, 
  height = 320, 
  render, 
  settings,
  offsetX,
  offsetY,
}) => {
  let refContainer: HTMLCanvasElement | undefined;

  const tick = () => {
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
    ctx.translate(el.width / 2, el.height / 2);
    ctx.scale(scale(), scale());
    ctx.translate(-el.width / 2 + offsetX(), -el.height / 2 + offsetY());

    render(
      ctx,
      settings(),
      scale(),
      offsetX(),
      offsetY(),
    );

    ctx.restore();
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
      class="border border-gray-300"
    />
  );
};

export default Renderer;