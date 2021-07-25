import lodash from 'lodash';

import ResizeObserver from 'resize-observer-polyfill';

import mq from '../utils/mq';

import Platform from '../constants/platform';
import Controller from './controller';

/*  Resize Controller

    1) Provides unified window / document / manual resize reference
    2) Separates read / write operations via update() and render() callbacks

*/

interface Coords {
  window: {
    width: number;
    height: number;
    last: {
      width: number;
      height: number;
    };
  };
}

interface Reference {
  sections?: NodeList | null;
}

interface Observers {
  resizeBody?: ResizeObserver | null;
  resizeSections?: ResizeObserver | null;
}

interface Throttled {
  measure?(): void;
}

interface States {
  lastPlatform: Platform;
  platform: Platform;
}

export interface ResizeSubscriber {
  die?: boolean;
  willRender?: boolean;
  update(): boolean;
  render(): void;
}

class ResizeController implements Controller {

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

  subscribers: ResizeSubscriber[] = [];

  initialize() {
    this.throttled.measure = lodash.throttle(this._measureNow.bind(this), 500, {
      leading: false,
      trailing: true,
    });
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
    this.observers.resizeSections = new ResizeObserver(this.#onResizeObserved);
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
      if (this.throttled.measure) {
        this.throttled.measure();
      }
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

  set = (subscriber: ResizeSubscriber): ResizeSubscriber => {
    subscriber.willRender = false;
    this.subscribers.push(subscriber);
    return subscriber;
  };

  clear = (subscriber: ResizeSubscriber) => {
    for (let i = 0; i < this.subscribers.length; i++) {
      const curSubscriber = this.subscribers[i];
      if (subscriber === curSubscriber) {
        this.subscribers.splice(i, 1);
        break;
      }
    }
  };

  clearByIndex = (index: number) => {
    this.subscribers.splice(index, 1);
  };

  // subscribe new object for only one tick cycle

  one(subscriber: ResizeSubscriber) {
    this.set(subscriber);
    subscriber.die = true;
  }

  // update (read cycle)

  update() {
    this.states.lastPlatform = this.states.platform;
    this.states.platform = this.platform;

    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber = this.subscribers[i];
      if (subscriber && subscriber.update()) subscriber.willRender = true;
    }
  }

  // render (write cycle)

  render() {
    const deadList: ResizeSubscriber[] = [];

    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber = this.subscribers[i];
      // will only fire if subscriber has returned true from previous update() cycle
      if (subscriber && subscriber.willRender) {
        subscriber.willRender = false;
        subscriber.render();
        if (subscriber.die) deadList.push(subscriber);
      }
    }

    // remove dead subscribers from array
    for (let i = 0; i < deadList.length; i++) {
      const subscriber: ResizeSubscriber = deadList[i];
      const index: number = this.subscribers.indexOf(subscriber);
      this.clearByIndex(index);
    }
  }

  // get device platform based on breakpoint

  get platform() {
    let platform = Platform.DESKTOP;

    if (mq.media('desktop-lg') || mq.media('desktop-xxxl')) {
      platform = Platform.DESKTOP_XL;
    } else if (mq.media('desktop-xl') || mq.media('desktop-lg') || mq.media('desktop')) {
      platform = Platform.DESKTOP;
    } else if (mq.media('tablet') || mq.media('mobile-h')) {
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
    return this.platform === Platform.MOBILE;
  }

  get isTablet() {
    return this.platform === Platform.TABLET;
  }

  // determine if platform just changed

  get isPlatformChange() {
    return this.states.platform !== this.states.lastPlatform;
  }

  // determine if viewport width or height changed

  get isViewportChange() {
    return (
      this.coords.window.width !== this.coords.window.last.width ||
      this.coords.window.height !== this.coords.window.last.height
    );
  }

}

export default new ResizeController();
