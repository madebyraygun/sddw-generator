/* Animation Controller

1) Provides unified requestAnimationFrame ticker
2) Separates read / write operations via update() and render() callbacks
    update() will call render() only if update() returns true
*/

import gsap from 'gsap';
import Controller from './controller';

export interface AnimationSubscriber {
  die?: boolean;
  willRender?: boolean;
  update: () => boolean;
  render?: (() => void) | null;
}

class AnimationController implements Controller {

  subscribers: AnimationSubscriber[] = []; // objects assigned via set() or one() subscribed to update() & render()

  initialize() {
    this.start();
  }

  loop() {
    this.update();
    this.render();
  }

  // update (read cycle)

  update() {
    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber: AnimationSubscriber = this.subscribers[i];
      if (subscriber && subscriber.update() && subscriber.render) subscriber.willRender = true;
    }
  }

  // render (write cycle)

  render() {
    const deadList: AnimationSubscriber[] = [];

    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber = this.subscribers[i];
      if (subscriber) {
        // subscribers flagged to render, render now
        if (subscriber.willRender && subscriber.render) {
          subscriber.willRender = false;
          subscriber.render();
        }

        // if subscriber is meant to be terminated after this cycle, remove it
        if (subscriber.die) deadList.push(subscriber);
      }
    }

    // remove dead subscribers from array
    for (let i = 0; i < deadList.length; i++) {
      const subscriber: AnimationSubscriber = deadList[i];
      const index: number = this.subscribers.indexOf(subscriber);
      this.clearByIndex(index);
    }
  }

  // start / stop animation loop

  start = () => {
    gsap.ticker.add(this.#onTick);
  };

  stop = () => {
    gsap.ticker.remove(this.#onTick);
  };

  #onTick = () => {
    this.loop();
  };

  // add / remove subscribers

  set = (subscriber: AnimationSubscriber): AnimationSubscriber => {
    subscriber.willRender = false;
    this.subscribers.push(subscriber);
    return subscriber;
  };

  clear = (subscriber: AnimationSubscriber) => {
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

  one = (subscriber: AnimationSubscriber) => {
    this.set(subscriber);
    subscriber.die = true;
  };

  renderOne = (callback: () => void) => {
    const tempSubscriber: AnimationSubscriber = {
      update: () => true,
      render: callback,
      die: true,
    };
    this.set(tempSubscriber);
  };

}

export default new AnimationController();
