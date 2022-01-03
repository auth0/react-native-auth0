import EventEmitter from 'events';

class CustomEmitter extends EventEmitter {
  remove() {
    this.removeAllListeners();
  }
}

export default class Linking {
  constructor() {
    this.emitter = new CustomEmitter();
  }

  addEventListener(event, fn) {
    return this.emitter.addListener(event, fn);
  }

  removeEventListener(event, fn) {
    this.emitter.removeListener(event, fn);
  }

  removeAllListeners() {
    this.emitter.removeAllListeners();
  }
}
