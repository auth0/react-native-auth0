class UsersAPI {
  constructor(token, baseUrl) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  patch(id, metadata) {
    if (id == null) {
      return Promise.reject("must supply an identifier of the user to be updated");
    }
    if (metadata == null || Object.keys(metadata).length == 0) {
      return Promise.reject("must supply a non empty user metadata object"); 
    }
    
    const payload = {
      "user_metadata": metadata
    };

    return fetch(`${this.baseUrl}/api/v2/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json());
  }
}

module.exports = UsersAPI;