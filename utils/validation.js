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
}

module.exports = {
  nonNull: nonNull,
  anObject: anObject
}
