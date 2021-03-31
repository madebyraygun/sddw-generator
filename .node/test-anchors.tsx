import { readdirSync, statSync, existsSync } from 'fs';
import ping from 'ping';

const sys: SystemData = {
  version: process.env.npm_package_version
};

global.dom = (
  tag: any,
  attrs: any,
  ...children: any
) => {
  if (typeof tag === 'function') {
    const props = attrs || {};
    props.children = children;
    return tag(props);
  } else if (typeof tag === 'string' && tag === 'a') {
    if (attrs.href.includes('http')) {
      ping.promise.probe(attrs.href.replace('http://', '').replace('https://', '')).then((res) => {
        if (!res.alive) throw Error(`${attrs.href} 404`);
      }).catch((e) => {
        throw Error(e.message);
      });
    } else {
      const path = `./pages${attrs.href === '/' ? '/index' : attrs.href}`;
      if (!existsSync(`${path}.tsx`) && !existsSync(`${path}/index.tsx`)) {
        throw Error(`page ${attrs.href} does not exist`);
      }
    }
  }
};

const testDirectory = (dir) => {
  readdirSync(dir).forEach((page) => {
    if (statSync(`${dir}${page}`).isDirectory()) {
      testDirectory(`${dir}${page}/`);
    } else {
      require(`.${dir}${page}`).default({ sys });
    }
  });
};

testDirectory('./pages/');