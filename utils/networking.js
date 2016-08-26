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
  let options = {
    method: method,
    headers: headers(additionalHeaders),
  };

  if (body != null) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options)
  .then(checkStatus)
  .then(response => response.json());
};

module.exports = {
  checkStatus: checkStatus,
  headers: headers,
  jsonRequest: jsonRequest
};
