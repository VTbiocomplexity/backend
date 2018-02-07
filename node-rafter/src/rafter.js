const rpcclient = require('./util/rpcclient');
const fetch = require('node-fetch');

class RafterService {
  constructor(url, token) {
    this._url = url
    this._token = token

    let client = rpcclient(this._url, this._token);
    this.rpc = (name, args) => {
      return new Promise((resolve, reject) => {
        client(name, args).then(resolve, reject);
      });
    }
  }

  get url() {
    return this._url
  }

  get token() {
    return this._token
  }

  makeRequest(url, opts={}) {
    // Build init without ... operator.
    let init = {
      method: 'GET',
    }
    for (let k in opts) init[k] = opts[k];
    init.headers = {
      'accept': 'application/json',
      'authorization': this.token,
    }
    for (let k in opts.headers) init.headers[k] = opts.headers[k];

    return fetch(
      url,
      init
    )
      .then(resp => {
        if(!resp.ok) throw new Error(resp.statusText);
        return resp.json();
      })
      .catch(err => Promise.reject(err));
  }
}

module.exports = RafterService
