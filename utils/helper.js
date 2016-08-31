export const isEmpty = object => {
  return object == null || (Object.keys(object).length === 0 && object.constructor === Object);
};
