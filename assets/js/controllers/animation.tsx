/* Animation Controller

1) Provides unified requestAnimationFrame ticker
2) Separates read / write operations via update() and render() callbacks
    update() will call render() only if update() returns true
*/

import gsap from 'gsap';

interface Subscriber {
  die: boolean,
  willRender: boolean,
  update(): boolean,
  render(): void
}

class AnimationController {

  subscribers: Subscriber[] = []; // objects assigned via set() or one() subscribed to update() & render()

  // initialize

  initialize() {
    this.start();
  }

  //

  loop() {
    this.update();
    this.render();
  }

  // update (read cycle)

  update() {
    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber: Subscriber = this.subscribers[i];
      if (subscriber && subscriber.update()) subscriber.willRender = true;
    }
  }

  // render (write cycle)

  render() {
    const deadList: Subscriber[] = [];

    for (let i = 0, l = this.subscribers.length; i < l; ++i) {
      const subscriber = this.subscribers[i];
      if (subscriber) {
        // subscribers flagged to render, render now
        if (subscriber.willRender) {
          subscriber.willRender = false;
          subscriber.render();
        }

        // if subscriber is meant to be terminated after this cycle, remove it
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

  // start / stop animation loop

  start = () => {
    gsap.ticker.add(this.#onTick);
  }

  stop = () => {
    gsap.ticker.remove(this.#onTick);
  }

  #onTick = () => {
    this.loop();
  }

  // add / remove subscribers

  set = (obj) => {
    obj.willRender = false;
    this.subscribers.push(obj);
    return this.subscribers.length - 1;
  }

  clear = (index) => {
    this.subscribers.splice(index, 1);
  }

  // subscribe new object for only one tick cycle

  one = (obj) => {
    const index = this.set(obj);
    this.subscribers[index].die = true;
  }

  renderOne = (callback) => {
    const index = this.set({
      update: () => true,
      render: callback,
    });
    this.subscribers[index].die = true;
  }

}

export default new AnimationController();
