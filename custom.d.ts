declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: {[className: string]: string};
  export default content;
}

interface Window {
  dom: (tag: (props: any) => void | Node, attrs: any, ...children: any) => void | Node;
  gapi: any;
  auth2: any;
}

interface SystemData {
  version?: string;
}

declare module JSX {
  type Element = Node;

  // extending react types with custom 'element' property on HTMLDivElement
  interface CustomElement {
    element?: string
  }
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & CustomElement;
  }
}

type FC<P = {}> = FunctionComponent<P>;

interface FunctionComponent<P = {}> {
  (props: P & { children?: any, sys?: SystemData }, context?: any): JSX.Element<any> | null;
  propTypes?: React.WeakValidationMap<P>;
  contextTypes?: React.ValidationMap<any>;
  defaultProps?: Partial<P>;
  displayName?: string;
}