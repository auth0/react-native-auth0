import EventEmitter from 'events';

class CustomEmitter extends EventEmitter {}

export default class Linking {
  constructor() {
    this.emitter = new CustomEmitter();
  }

  addEventListener(event, fn) {
    this.emitter.addListener(event, fn);
  }

  removeEventListener(event, fn) {
    this.emitter.removeListener(event, fn);
  }
}