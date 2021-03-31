import Router from './utils/router';

import CONFIG from '../../config.json';

const success = (message: string) => {
  console.log(`%c${message}`, 'color: #0f0;'); // eslint-disable-line no-console
};

interface Routes {
  [path: string]: (page: string, secondary?: string) => void;
}

const routing: Routes = {};

const addRoute = (url: string, page: any) => {
  routing[url] = () => renderPage(page());
};

const requirePages = (r: any) => {
  const keys = r.keys();
  keys.map((path: string) => {
    addRoute(path.replace('.', '').replace('.tsx', '').replace('index', ''), r(path).default);
  });
  success(`${keys.length} pages loaded`);
};

const requireComponents = (r: any) => {
  const keys = r.keys();
  keys.forEach(r);
  success(`${keys.length} components loaded`);
};

const renderPage = (page: Node | string) => {
  const main = document.querySelector('main');
  if (main) {
    if (typeof page === 'string') {
      main.innerHTML = page;
    } else {
      main.innerHTML = '';
      main.append(page);
    }
  }
};

// require all JSX files for proper linting
requirePages(require.context('../../pages/', true, /\.tsx$/));
requireComponents(require.context('../../components/', true, /\.tsx$/));

document.addEventListener('DOMContentLoaded', () => {
  console.log('SSR', CONFIG.ssr); // eslint-disable-line no-console

  if (CONFIG.ssr) {
    let initialized = false;
    const open = async (page: string, secondary?: string) => {
      if (!initialized) {
        initialized = true;
        return;
      }
      const path = `/${page !== 'index' ? `${page}/` : ''}${secondary ? `${secondary}/` : ''}`;
      const html = await fetch(`${path}body.html`).then((res) => (res.ok ? res.text() : fetch('/404/body.html').then((r) => r.text())));
      renderPage(html);
    };
    Router.start({
      '/': () => open('index'),
      '/:page/?:secondary': (page: string, secondary?: string) => open(page, secondary)
    });
  } else {
    Router.start(routing);
  }
});