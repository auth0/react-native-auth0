const nonNull = (value, message) => {
  if (value == null) {
      return Promise.reject(new Error(message));
  }
  return Promise.resolve(value);
};

const anObject = (value, message) => {
  if (typeof value === "object") {
    return Promise.resolve(value);
  }
  return Promise.reject(new Error(message));
};

const anyOf = (value, list = [], message) => {
  if (list.indexOf(value) != -1) {
    return Promise.resolve(value);
  }
  return Promise.reject(new Error(message));
};

module.exports = {
  nonNull: nonNull,
  anObject: anObject,
  anyOf: anyOf
};
