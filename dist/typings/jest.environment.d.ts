/**
 * Custom Jest Environment based on JSDOMEnvironment to support TextEncoder and TextDecoder.
 *
 * ref: https://github.com/jsdom/jsdom/issues/2524
 */
export default class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config: any, context: any);
}
import JSDOMEnvironment from 'jest-environment-jsdom';
