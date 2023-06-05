import JSDOMEnvironment from 'jest-environment-jsdom';
import fetch, {Headers, Request, Response} from 'node-fetch';

/**
 * Custom Jest Environment based on JSDOMEnvironment to support TextEncoder and TextDecoder.
 *
 * ref: https://github.com/jsdom/jsdom/issues/2524
 */
export default class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();

    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
  }
}

module.exports = CustomJSDOMEnvironment;
