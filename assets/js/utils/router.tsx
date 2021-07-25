interface Redirects {
  [from: string]: string;
}

interface Route {
  params: string[];
  fn: (...variables: string[]) => void;
}

class Router {

  routes: string[] = [];
  map: { [key: string]: Route } = {};

  root = '/';

  http404 = '/404';

  redirects: Redirects = {};

  constructor() {
    this.addEventListeners();
  }

  parse(path: string) {
    return decodeURI(path)
      .split('/')
      .filter((v) => {
        return v !== '' ? v : null;
      });
  }

  route(path: string, fn: () => void) {
    const params = this.parse(path);
    this.routes.push(path);
    this.map[path] = {
      params,
      fn,
    };
  }

  navigate(path: string, history = true) {
    if (path !== window.location.pathname) {
      let finalPath = path;
      if (this.redirects[path]) finalPath = this.redirects[path];
      window.history[!history ? 'replaceState' : 'pushState'](false, '', this.root.replace(/\/$/, '') + finalPath);
    }

    this.check();
  }

  redirect(urls: Redirects) {
    this.redirects = { ...this.redirects, ...urls };
  }

  check() {
    let path = window.location.pathname.replace(this.root.replace(/\/$/, ''), ''),
      match = {
        route: '',
        accuracy: 0,
        variables: [] as string[],
      };

    if (this.redirects[path]) path = this.redirects[path];

    const params = this.parse(path);

    for (const i in this.routes) {
      const routeParams = this.map[this.routes[i]].params;
      const variables: string[] = [];
      let accuracy = 0;
      if (params.length) {
        if (params.length <= routeParams.length) {
          for (const p in routeParams) {
            if (params[p]) {
              if (params[p] === routeParams[p]) {
                accuracy += 100;
              } else if (routeParams[p].charAt(0) === ':') {
                accuracy += 5;
                variables.push(params[p]);
              } else if (routeParams[p].charAt(0) === '?') {
                accuracy += 1;
                if (routeParams[p].charAt(1) === ':') variables.push(params[p]);
              } else {
                accuracy = 0;
                break;
              }
            } else if (routeParams[p].charAt(0) !== '?') {
              accuracy = 0;
            }
          }
        }
      } else {
        match = { route: '/', accuracy, variables };
      }
      if (accuracy && accuracy >= match.accuracy) {
        match = { route: this.routes[i], accuracy, variables };
      }
    }

    if (match.route && this.map[match.route]) {
      this.map[match.route].fn(...match.variables);
    } else if (this.map[this.http404]) {
      this.map[this.http404].fn();
    }
  }

  start(routes: any) {
    if (routes) {
      for (const r in routes) this.route(r, routes[r]);
    }
    this.check();
  }

  _windowOnPopstate() {
    this.check();
  }

  addEventListeners() {
    this._windowOnPopstate = this._windowOnPopstate.bind(this);

    window.addEventListener('popstate', this._windowOnPopstate);
  }

  removeEventListeners() {
    window.removeEventListener('popstate', this._windowOnPopstate);
  }

}

export default new Router();
