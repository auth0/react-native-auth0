import Auth0Error from './error';

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
      throw new Auth0Error(json, response);
    });
};

const headers = (headers = {}) => {
  return Object.assign({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }, headers);
};

const json = (method, url, body, additionalHeaders = {}) => {
  return request(method, url, body, additionalHeaders)
    .then(response => response.json());
};

const request = (method, url, body, additionalHeaders = {}) => {
  let options = {
    method: method,
    headers: headers(additionalHeaders),
  };

  if (body != null) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options)
    .then(checkStatus);
};

module.exports = {
  json: json,
  request: request
};
