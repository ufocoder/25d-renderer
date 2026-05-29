import { type Component, type JSX } from 'solid-js';

interface LabelProps {
  class?: string;
  children: JSX.Element;
}

const Label: Component<LabelProps> = (props) => {
  return (
    <code class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
      {props.children}
    </code>
  );
};

export default Label;
