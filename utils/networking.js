import AuthenticationError from '../auth/authentication-error'

const checkStatus = (response) => {
  if (response.ok) {
    return response;
  }
  return response.json()
    .catch(() => {
      var error = new Error(response.statusText || response.status);
      error.response = response;
      throw error;
    })
    .then(json => {
      throw new AuthenticationError(json);
    });
};

const headers = (headers = {}) => {
  return Object.assign({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }, headers);
};

const jsonRequest = (method, url, body, additionalHeaders = {}) => {
  return fetch(url, {
    method: method,
    headers: headers(additionalHeaders),
    body: JSON.stringify(body)
  })
  .then(checkStatus)
  .then(response => response.json());
};

module.exports = {
  checkStatus: checkStatus,
  headers: headers,
  jsonRequest: jsonRequest
};
