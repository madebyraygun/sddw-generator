import EventEmitter from 'events';

import Controller from './controller';


export interface EmitterSubscriber {
  key: any,
  emitter: EventEmitter,
  die?: boolean,
}

class EventController implements Controller {

  emitters: EmitterSubscriber[] = [];

  initialize() {
    console.log('event controller');
  }

  // add / remove subscribers

  set = (key: any): EmitterSubscriber => {
    let emitter: EmitterSubscriber | null = this.get(key);
    if (!emitter) {
      emitter = {
        key,
        emitter: new EventEmitter()
      };
      this.emitters.push(emitter);
    } else {
      console.warn(`EventController: Matching key ${key}. Attempt to set subscriber failed.`);
    }
    return emitter;
  }

  clear = (emitter: EmitterSubscriber) => {
    for (let i = 0; i < this.emitters.length; i++) {
      const curEmitter = this.emitters[i];
      if (emitter === curEmitter) {
        this.emitters.splice(i, 1);
        break;
      }
    }
  }

  clearByIndex = (index: number) => {
    this.emitters.splice(index, 1);
  }

  // subscribe new object for only one emit

  one = (emitter: EmitterSubscriber) => {
    this.set(emitter);
    emitter.die = true;
  }

  // find a subscriber by its key

  get = (key: any): EmitterSubscriber | null => {
    for (let i = 0; i < this.emitters.length; i++) {
      const curEmitter = this.emitters[i];
      if (curEmitter.key === key) {
        return curEmitter;
      }
    }
    return null;
  }

}

export default new EventController();