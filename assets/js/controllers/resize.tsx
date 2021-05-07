import lodash from 'lodash';

import ResizeObserver from 'resize-observer-polyfill';

import mq from '../utils/mq';

import Platform from '../constants/platform';

/*  Resize Controller

    1) Provides unified window / document / manual resize reference
    2) Separates read / write operations via update() and render() callbacks

*/

interface Coords {
  window: {
    width: number,
    height: number,
    last: {
      width: number,
      height: number,
    }
  }
}

interface Reference {
  sections?: NodeList | null;
}

interface Observers {
  resizeBody?: ResizeObserver | null,
  resizeSections?: ResizeObserver | null,
}

interface Throttled {
  measure?(): void
}

interface States {
  lastPlatform: Platform,
  platform: Platform,
}

interface Subscriber {
  updated: boolean,
  die: boolean,
  update(): boolean,
  render(): void
}

class ResizeController {

  coords: Coords = {
    window: {
      width: 0,
      height: 0,
      last: {
        width: 0,
        height: 0,
      },
    },
  };

  ref: Reference = {
    sections: null,
  };

  observers: Observers = {
    resizeBody: null,
    resizeSections: null,
  };

  throttled: Throttled = {};

  states: States = {
    lastPlatform: Platform.DESKTOP,
    platform: Platform.DESKTOP,
  };

  subscribers: Subscriber[] = [];

  initialize() {
    this.throttled.measure = lodash.throttle(
      this._measureNow.bind(this),
      500,
      {
        leading: false,
        trailing: true,
      },
    );
    this.addEventListeners();
    this.measure(true);
  }

  // listeners

  addEventListeners() {
    this.observers.resizeBody = new ResizeObserver(this.#onResizeObserved);
    this.observers.resizeBody.observe(document.body);
  }

  removeEventListeners() {
    this.observers.resizeBody?.disconnect();
    this.observers.resizeBody = null;
  }

  // observe individual sections (necessary for smooth scrolling)

  observeSections(sections: NodeList) {
    this.disconnectSections();
    this.observers.resizeSections = new ResizeObserver(
      this.#onResizeObserved,
    );
    for (let i = 0; i < sections.length; i++) {
      const $section: HTMLElement = sections[i] as HTMLElement;
      this.observers.resizeSections.observe($section);
    }
  }

  disconnectSections() {
    if (this.observers.resizeSections) {
      this.observers.resizeSections.disconnect();
      this.observers.resizeSections = null;
    }
  }

  // listener methods

  #onResizeObserved = () => {
    this.measure();
  };

  //

  measure(instant = false) {
    if (instant) {
      this._measureNow();
    } else {
      this.throttled.measure();
    }
  }

  _measureNow() {
    this.coords.window.last.width = this.coords.window.width;
    this.coords.window.last.height = this.coords.window.height;

    this.coords.window.width = window.innerWidth;
    this.coords.window.height = window.innerHeight;

    this.update();
    this.render();
  }

  // add / remove subscribers

  set(subscriber: Subscriber): number {
    subscriber.updated = false;
    this.subscribers.push(subscriber);
    return this.subscribers.length - 1;
  }

  clear(index: number) {
    this.subscribers.splice(index, 1);
  }

  // subscribe new object for only one tick cycle

  one(subscriber: Subscriber) {
    const index = this.set(subscriber);
    this.subscribers[index].die = true;
  }

  // update (read cycle)

  update() {
    this.states.lastPlatform = this.states.platform;
    this.states.platform = this.platform;

    const e = {
      isViewportChange: this.isViewportChange,
      isPlatformChange: this.isPlatformChange,
    };

    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber = this.subscribers[i];
      if (subscriber && subscriber.update(e)) subscriber.updated = true;
    }
  }

  // render (write cycle)

  render() {
    const e = {
      isViewportChange: this.isViewportChange,
      isPlatformChange: this.isPlatformChange,
    };

    const deadList: Subscriber[] = [];

    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber = this.subscribers[i];
      // will only fire if subscriber has returned true from previous update() cycle
      if (subscriber && subscriber.updated) {
        subscriber.updated = false;
        subscriber.render(e);
        if (subscriber.die) deadList.push(subscriber);
      }
    }

    // remove dead subscribers from array
    for (let i = 0; i < deadList.length; i++) {
      const subscriber: Subscriber = deadList[i];
      const index: number = this.subscribers.indexOf(subscriber);
      this.clear(index);
    }
  }

  // get device platform based on breakpoint

  get platform() {
    let platform = Platform.DESKTOP;

    if (mq('4xl') || mq('xxxl')) {
      platform = Platform.DESKTOP_XL;
    } else if (mq('xxl') || mq('xl') || mq('lg')) {
      platform = Platform.DESKTOP;
    } else if (mq('md') || mq('sm')) {
      platform = Platform.TABLET;
    } else {
      platform = Platform.MOBILE;
    }

    return platform;
  }

  // simple question: desktop or not?

  get isDesktop() {
    return !(this.platform === Platform.MOBILE || this.platform === Platform.TABLET);
  }

  get isMobile() {
    return (this.platform === Platform.MOBILE);
  }

  get isTablet() {
    return (this.platform === Platform.TABLET);
  }

  // determine if platform just changed

  get isPlatformChange() {
    return this.states.platform !== this.states.lastPlatform;
  }

  // determine if viewport width or height changed

  get isViewportChange() {
    return (
      this.coords.window.width !== this.coords.window.last.width
          || this.coords.window.height !== this.coords.window.last.height
    );
  }

}

export default new ResizeController();
