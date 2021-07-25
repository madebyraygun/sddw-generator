// global data
const sys: SystemData = {
  version: process.env.npm_package_version,
};

const isSVG = (tag: string) => {
  const SVGTags = ['svg', 'g', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect'];
  return SVGTags.includes(tag);
};

const setAttributes = (element: SVGElement | HTMLElement, attrs: any) => {
  for (const property in attrs) {
    if (property !== 'element') {
      const value = attrs[property];
      if (property === 'className') {
        if (value) element.setAttribute('class', value);
      } else if (property.startsWith('on') && typeof value === 'function') {
        element.addEventListener(property.substring(2).toLowerCase(), value);
      } else if (property === 'style') {
        let styles = '';
        for (const rule in value) {
          const dashed = rule.replace(/[A-Z]/g, (s) => '-' + s.toLowerCase());
          styles += `${dashed}:${value[rule]};`;
        }
        element.setAttribute('style', styles);
      } else {
        if (typeof value === 'boolean' && value && !property.startsWith('data-')) {
          element.setAttribute(property, '');
        } else {
          element.setAttribute(property, value);
        }
      }
    }
  }
};

const appendChildren = (element: SVGElement | HTMLElement, children: any[]) => {
  for (const child of children) {
    if (typeof child === undefined || child === null) return;
    if (Array.isArray(child)) {
      appendChildren(element, child);
    } else if (child instanceof Node) {
      element.appendChild(child.cloneNode(true));
    } else if (child) {
      element.appendChild(document.createTextNode(child));
    }
  }
};

window.dom = (tag: (props: any) => void | Node, attrs: any, ...children: any): Node | void => {
  if (typeof tag === 'function') {
    const props = attrs || {};
    props.children = children;
    // attach global data
    props.sys = sys;
    return tag(props);
  } else if (typeof tag === 'string') {
    // virtual dom
    // console.log(tag, attrs, children);
    const element = isSVG(tag)
      ? (document.createElementNS('http://www.w3.org/2000/svg', tag) as SVGElement)
      : (document.createElement(attrs?.element || tag) as HTMLElement);
    if (attrs) setAttributes(element, attrs);
    appendChildren(element, children);
    return element;
  }
};
