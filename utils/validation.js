import { isEmpty } from './helper';

export const nonNull = (value, message) => {
  if (value == null) {
      return Promise.reject(new Error(message));
  }
  return Promise.resolve(value);
};

export const anObject = (value, message) => {
  if (typeof value === "object") {
    return Promise.resolve(value);
  }
  return Promise.reject(new Error(message));
};

export const nonEmptyObject = (value, message) => {
  if (typeof value !== "object" || isEmpty(value)) {
    return Promise.reject(new Error(message));
  }
  return Promise.resolve(value);
};

export const anyOf = (value, list = [], message) => {
  if (list.indexOf(value) != -1) {
    return Promise.resolve(value);
  }
  return Promise.reject(new Error(message));
};
