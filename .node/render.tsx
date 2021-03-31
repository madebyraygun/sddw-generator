import { readdirSync, statSync, writeFileSync } from 'fs';
import mkdirp from 'mkdirp';
import 'dotenv/config';
import watch from 'node-watch';
import 'jsdom-global/register';

import './jsx-factory';

import CONFIG from '../config.json';

const clearCache = () => {
  for (const path in require.cache) {
    if (!path.includes('/node_modules/')) {
      delete require.cache[path];
    }
  }
};

const renderPages = async (dir: string) => {
  const { default: HTML } = await import('../components/app/html');
  const { default: Base } = await import('../components/app/base');
  readdirSync(`./pages${dir}`).forEach(async (page) => {
    if (statSync(`./pages${dir}${page}`).isDirectory()) {
      renderPages(`${dir}${page}/`);
    } else {
      const { default: Page } = await import(`../pages${dir}${page}`);
      const name = page.replace('.tsx', '');
      const path = `./out/${dir.replace('/', '')}${name !== 'index' ? `${name}/` : ''}`;
      mkdirp.sync(path);
      try {
        writeFileSync(`${path}index.html`, (
          <HTML mode={process.env.npm_config_mode}>
            <Base>
              <Page />
            </Base>
          </HTML>
        ), 'utf8');
        writeFileSync(`${path}body.html`, <Page />, 'utf8');
      } catch (e) {
        console.log(e);
      }
    }
  });
};

const renderIndex = async () => {
  const { default: HTML } = await import('../components/app/html');
  const { default: Base } = await import('../components/app/base');
  try {
    writeFileSync('./out/index.html', (
      <HTML mode={process.env.npm_config_mode}>
        <Base />
      </HTML>
    ), 'utf8');
  } catch (e) {
    console.log(e);
  }
};

const render = () => {
  clearCache();
  CONFIG.ssr ? renderPages('/') : renderIndex();
};

render();

if (process.env.npm_config_watch) {
  watch('./pages', { recursive: true, filter: /\.tsx$/ }, render);
  watch('./components', { recursive: true, filter: /\.tsx$/ }, render);
}
