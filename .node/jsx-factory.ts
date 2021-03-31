// global data
const sys: SystemData = {
  version: process.env.npm_package_version
};

const renderAttributes = (attrs: any) => {
  let attrJoined = '';
  for (const property in attrs) {
    if (property !== 'element') {
      const value = attrs[property];
      if (property === 'className') {
        if (value) attrJoined += ` class="${value}"`;
      } else if (property.startsWith('html')) {
        attrJoined += ` ${property.replace('html', '').toLowerCase()}="${value}"`;
      } else if (property.startsWith('on') && typeof value === 'function') {
        // ignore functions
      } else {
        if (typeof value === 'boolean' && value && !property.startsWith('data-')) {
          attrJoined += ` ${property}`;
        } else if (typeof value !== 'undefined') {
          attrJoined += ` ${property}="${value}"`;
        }
      }
    }
  }
  return attrJoined;
};

const renderChildren = (children: any[]) => {
  let childrenJoined = '';
  for (const child of children) {
    if (typeof child === undefined || child === null) return;
    if (Array.isArray(child)) {
      childrenJoined += renderChildren(child);
    } else if (child) {
      childrenJoined += child;
    }
  }
  return childrenJoined;
};

global.dom = (tag: (props: any) => string | void, attrs: any, ...children: any): string | void => {
  if (typeof tag === 'function') {
    const props = attrs || {};
    props.children = children;
    // attach global data
    props.sys = sys;
    return tag(props);
  } else if (typeof tag === 'string') {
    // virtual dom
    // console.log(tag, attrs, children);
    let element = `<${attrs?.element || tag}`;
    if (attrs) element += renderAttributes(attrs);
    element += '>';
    element += renderChildren(children);
    element += `</${attrs?.element || tag}>`;
    return element;
  }
};