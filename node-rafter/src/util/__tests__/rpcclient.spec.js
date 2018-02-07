const rpcclient = require('../rpcclient');
const nock = require('nock');

let url = 'http://localhost/';
let token = 'token';

describe('rpcclient', () => {
  it('returns a curried function', () => {
    curried = new rpcclient('/endpoint', 'mytoken')
    return expect(typeof curried).toEqual('function');
  });

  it('posts to endpoint', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        }
      })
      .post('/', {
        id: /[0-9]+/,
        method: 'ls',
        params: [],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    rpc = new rpcclient(url, token);
    return expect(rpc('ls', [])).resolves.toEqual('ok');
  });

  it('rejects when there is an error code', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        }
      })
      .post('/', {
        id: /[0-9]+/,
        method: 'ls',
        params: [],
        jsonrpc: '2.0'
      })
      .reply(400, {error: 'not ok'});

    rpc = new rpcclient(url, token);
    return expect(rpc('ls', [])).rejects.toEqual('Bad Request');
  });

  it('rejects when there is an error in the request', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        }
      })
      .post('/', {
        id: /[0-9]+/,
        method: 'ls',
        params: [],
        jsonrpc: '2.0'
      })
      .replyWithError('not ok');

    rpc = new rpcclient(url, token);
    return expect(rpc('ls', [])).rejects.toEqual(expect.any(Error));
  });

  it('rejects when there is an error in the json response', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        }
      })
      .post('/', {
        id: /[0-9]+/,
        method: 'ls',
        params: [],
        jsonrpc: '2.0'
      })
      .reply(200, {error: 'not ok'});

    rpc = new rpcclient(url, token);
    return expect(rpc('ls', [])).rejects.toEqual('not ok');
  });

  it('rejects when there is no result in the json response', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        }
      })
      .post('/', {
        id: /[0-9]+/,
        method: 'ls',
        params: [],
        jsonrpc: '2.0'
      })
      .reply(200, {});

    rpc = new rpcclient(url, token);
    return expect(rpc('ls', [])).rejects.toEqual('Missing result');
  });

  it('rejects when there is no json response', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'content-type': 'application/jsonrequest',
          'authorization': token
        }
      })
      .post('/', {
        id: /[0-9]+/,
        method: 'ls',
        params: [],
        jsonrpc: '2.0'
      })
      .reply(200);

    rpc = new rpcclient(url, token);
    return expect(rpc('ls', [])).rejects.toEqual('Missing response');
  });
});
