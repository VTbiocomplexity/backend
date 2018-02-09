const fetch = require('node-fetch');

var idx = 0;

module.exports = function(endpoint, token){
  return function(method, params){
    var req = {
      id: idx++, 
      method: method, 
      params: params, 
      jsonrpc: "2.0"
    };

    return fetch(
      endpoint,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        },
        body: JSON.stringify(req)
      })
      .then(res => {
        if (!res.ok) return Promise.reject(res.statusText);
        return res.json().catch(err => Promise.reject('Missing response'));
      })
      .then(data => {
        if (data.error) {
          return Promise.reject(data.error);
        }

        if (!data.result) {
          return Promise.reject('Missing result');
        }

        return data.result;
      })
      .catch(err => Promise.reject(err));
  }
}

