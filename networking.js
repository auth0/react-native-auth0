import AuthenticationError from './authentication-error'

module.exports = {
  checkStatus: (response) => {
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
  },

  headers: (headers = {}) => {
    return Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, headers);
  }
  
};
