import faker from 'faker';

const verifyError = (promise, api, url) => {
  const code = faker.hacker.adjective();
  const description = faker.hacker.phrase();
  api.failResponse(url, code, description);
  return promise
    .then(() => fail('not supposed to succeed'))
    .catch(error => expect(error.name).toEqual(code));
};

module.exports = {
  verifyError: verifyError
};
