const VolumeService = require('../volume');
const nock = require('nock');
const { Readable, PassThrough } = require('stream');

let url = 'http://rafter.bi.vt.edu/';
let token = 'token';

describe('VolumeService', () => {
  it('passes params on to super', () => {
    let vs = new VolumeService(url, token);

    expect(vs.url).toBe(url);
    expect(vs.token).toBe(token);
  });
});

const vs = new VolumeService(url, token);

describe('VolumeService.init()', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('resolves truthy when we are authorized', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'authorization': token
        }
    })
      .get('/initialize')
      .reply(200, '{}');

    return expect(vs.init()).resolves.toBeTruthy();
  });
  
  it('rejects to falsy when we are not authorized', () => {
    nock(url, {
        reqheaders: {
          'accept': 'application/json',
          'authorization': token
        }
    })
      .get('/initialize')
      .reply(403, 'forbidden');

    return expect(vs.init()).rejects.toEqual(expect.any(Error));
  });
});

describe('VolumeService.get()', () => {
  afterEach(nock.cleanAll);

  it('resolves to a readable stream', () => {
    nock(url, {
      reqheaders: {
        'accept': '*/*',
        'authorization': token
      }
    })
      .get('/file/test/path')
      .reply(200, 'body');

    return expect(vs.get('/test/path')).resolves.toEqual(expect.any(Readable));
  });

  it('rejects when the resoponse is not ok', () => {
    nock(url, {
      reqheaders: {
        'accept': '*/*',
        'authorization': token
      }
    })
      .get('/file/test/path')
      .reply(404, 'body');

    return expect(vs.get('/test/path')).rejects.toEqual('Not Found');
  });
});

describe('VolumeService.put()', () => {
  afterEach(nock.cleanAll);

  it('send PUT', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'authorization': token
      }
    })
      .put('/file/test/path', 'body')
      .reply(200, {name: 'path'});

    return expect(vs.put('/test/path', 'body')).resolves.toEqual({name: 'path'});
  });

  it('can stream to put', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'authorization': token
      }
    })
      .put('/file/test/path')
      .reply(200, {name: 'path'});

    let stream = new PassThrough();

    stream.write('Hello ');
    setTimeout(() => stream.end('World!'));

    return expect(vs.put('/test/path', stream)).resolves.toEqual({name: 'path'});
  });
});

describe('VolumeService.openWriteStream()', () => {
  it('throws an error when we do not provide a path', () => {
    return expect(() => {
      vs.openWriteStream({}, null);
    })
      .toThrow();
  });

  it('throws an error when we do not provide a file name', () => {
    return expect(() => {
      vs.openWriteStream({path: 'path'}, null);
    })
      .toThrow();
  });

  it('streams the request body', done => {
    let path = '/test/path'
    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {result: 'ok'});

    let createScope = nock(url)
      .post('/file/test/path/')
      .reply(200, {result: 'ok'});

    let putScope = nock(url)
      .put('/file/test/path/testFile')
      .reply(200, (uri, body) => {

        return {body};
      });

    let cb = (err, body, stream) => {
      expect(err).toBeNull();
      expect(body.body).toBe('Hello world!');
      done();
    };

    let passthrough = vs.openWriteStream({path: '/test/path', name: 'testFile'}, {}, cb);

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  it('streams the request body when there is a trailing /', done => {
    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {result: 'ok'});

    let createScope = nock(url)
      .post('/file/test/path/')
      .reply(200, {result: 'ok'});

    let putScope = nock(url)
      .put('/file/test/path/testFile')
      .reply(200, (uri, body) => {

        return {body};
      });

    let cb = (err, body, stream) => {
      expect(err).toBeNull();
      expect(body.body).toBe('Hello world!');
      done();
    };

    let passthrough = vs.openWriteStream({path: '/test/path/', name: 'testFile'}, {}, cb);

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  it('streams the request body when the type is defined', done => {
    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {result: 'ok'});

    let createScope = nock(url)
      .post('/file/test/path/')
      .reply(200, {result: 'ok'});

    let putScope = nock(url)
      .put('/file/test/path/testFile')
      .reply(200, (uri, body) => {

        return {body};
      });

    let cb = (err, body, stream) => {
      expect(err).toBeNull();
      expect(body.body).toBe('Hello world!');
      done();
    };

    let passthrough = vs.openWriteStream({path: '/test/path/', name: 'testFile', type: 'text'}, {}, cb);

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  it('streams the request body even with a delay in the write side', done => {
    let file = {
      path: '/test/path',
      name: 'testFile'
    }

    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {result: 'ok'});

    let createScope = nock(url)
      .post('/file/test/path/')
      .reply(200, {result: 'ok'});

    let putScope = nock(url)
      .put('/file/test/path/testFile')
      .reply(200, (uri, body) => {
        return {body};
      });

    let cb = (err, body, stream) => {
      expect(err).toBeNull();
      expect(body.body).toBe('Hello world!');
      done();
    };

    let passthrough = vs.openWriteStream(file, {}, cb);

    passthrough.write('Hello ');
    setTimeout(() => passthrough.end('world!'), 1000);
  });

  it('streams the request body even with a delay in the read side', done => {
    let file = {
      path: '/test/path',
      name: 'testFile'
    }

    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {result: 'ok'});

    let createScope = nock(url)
      .post('/file/test/path/')
      .reply(200, {result: 'ok'});

    let putScope = nock(url)
      .put('/file/test/path/testFile')
      .delay(1000)
      .reply(200, (uri, body) => {
        return {body};
      });

    let cb = (err, body, stream) => {
      expect(err).toBeNull();
      expect(body.body).toBe('Hello world!');
      done();
    };

    let passthrough = vs.openWriteStream(file, {}, cb);

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  it('streams the request body even with a delay in the read and write side', done => {
    let file = {
      path: '/test/path',
      name: 'testFile'
    }

    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {result: 'ok'});

    let createScope = nock(url)
      .post('/file/test/path/')
      .reply(200, {result: 'ok'});

    let putScope = nock(url)
      .put('/file/test/path/testFile')
      .delay(1000)
      .reply(200, (uri, body) => {
        return {body};
      });

    let cb = (err, body, stream) => {
      expect(err).toBeNull();
      expect(body.body).toBe('Hello world!');
      done();
    };

    let passthrough = vs.openWriteStream(file, {}, cb);

    passthrough.write('Hello ');
    setTimeout(() => passthrough.end('world!'), 1000);
  });

  it('error gets emitted when there is an error with default callback', done => {
    let file = {
      path: '/test/path',
      name: 'testFile'
    }

    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {error: 'not ok'});

    let passthrough = vs.openWriteStream(file, {});

    passthrough.on('error', (err) => {
      done();
    });

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  it('error gets emitted with destroy when destroy is not implemented when there is an error with default callback', done => {
    let file = {
      path: '/test/path',
      name: 'testFile'
    }

    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {error: 'not ok'});

    let passthrough = vs.openWriteStream(file, {});

    /* Destroy destroy ;) */
    passthrough.destroy = undefined;

    passthrough.on('error', (err) => {
      done();
    });

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  it('error gets emitted with destroy when destroy is implemented when there is an error with default callback', done => {
    let file = {
      path: '/test/path',
      name: 'testFile'
    }

    let mkdirScope = nock(url)
      .post('/')
      .reply(200, {error: 'not ok'});

    let passthrough = vs.openWriteStream(file, {});

    /* Naive destroy implementation. */
    passthrough.destroy = (err) => {
      passthrough.emit('error', err);
      passthrough.emit('close', err);
    }

    passthrough.on('error', (err) => {
      done();
    });

    passthrough.write('Hello ');
    passthrough.end('world!');
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

describe('VolumeService.set', () => {
  it('throws a TypeError when arguments are not arrays of length 2', () => {
    let thrower = () => vs.set('x', 'not a pair');
    expect(thrower).toThrowError(TypeError);
  });

  it('creates a patch from the one k-v pair', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [{op: 'add', path: '/usermeta/foo', value: 'bar'}]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.set('/test/path', ['foo', 'bar'])).resolves.toEqual('ok');
  });

  it('creates patches from the multiple k-v pairs', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [
          {op: 'add', path: '/usermeta/foo', value: 'bar'}, 
          {op: 'add', path: '/usermeta/baz', value: 'qux'}
        ]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.set('/test/path', ['foo', 'bar'], ['baz', 'qux'])).resolves.toEqual('ok');
  });

  it('creates a special patch for type key', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [{op: 'replace', path: '/type', value: 'foo'}]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.set('/test/path', ['type', 'foo'])).resolves.toEqual('ok');
  });

  it('creates a special patch for public key', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [{op: 'add', path: '/public', value: true}]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.set('/test/path', ['public', true])).resolves.toEqual('ok');
  });
});

describe('VolumeService.unset', () => {
  it('creates a patch from the one key', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [{op: 'remove', path: '/usermeta/foo'}]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.unset('/test/path', 'foo')).resolves.toEqual('ok');
  });

  it('creates a patch from the multiple keys', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [
          {op: 'remove', path: '/usermeta/foo'},
          {op: 'remove', path: '/usermeta/bar'}
        ]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.unset('/test/path', 'foo', 'bar')).resolves.toEqual('ok');
  });

  it('unsetting public removes /public, not /usermeta/public', () => {
    nock(url)
      .post('/', {
        method: 'patch',
        id: /[0-9]+/,
        params: ['/test/path', [
          {op: 'remove', path: '/public'},
        ]],
        jsonrpc: '2.0'
      })
      .reply(200, {result: 'ok'});

    return expect(vs.unset('/test/path', 'public')).resolves.toEqual('ok');
  });
});

let rpcVs = new VolumeService(url, token);

describe('rpc functions', () => {
  beforeEach(() => {
    rpcVs.rpc = jest.fn();
  });

  it('list uses an rpc call', () => {
    rpcVs.list('/test/path');
    expect(rpcVs.rpc).toHaveBeenCalledWith('ls', ['/test/path']);
  });

  it('chown uses an rpc call', () => {
    rpcVs.chown('/test/path', 'user', true);
    expect(rpcVs.rpc).toHaveBeenCalledWith('chown', ['/test/path', 'user', true]);
  });

  it('chown uses an rpc call default', () => {
    rpcVs.chown('/test/path', 'user');
    expect(rpcVs.rpc).toHaveBeenCalledWith('chown', ['/test/path', 'user', false]);
  });

  it('find uses an rpc call', () => {
    rpcVs.find('/test/path', 'query', true);
    expect(rpcVs.rpc).toHaveBeenCalledWith('find', ['/test/path', 'query', true]);
  });

  it('find uses an rpc call default', () => {
    rpcVs.find('/test/path', 'query');
    expect(rpcVs.rpc).toHaveBeenCalledWith('find', ['/test/path', 'query', false]);
  });

  it('grant uses an rpc call', () => {
    rpcVs.grant('/test/path', 'priv', 'user', true);
    expect(rpcVs.rpc).toHaveBeenCalledWith('grant', ['/test/path', 'priv', 'user', true]);
  });

  it('grant uses an rpc call default', () => {
    rpcVs.grant('/test/path', 'priv', 'user');
    expect(rpcVs.rpc).toHaveBeenCalledWith('grant', ['/test/path', 'priv', 'user', false]);
  });

  it('mkdir uses an rpc call', () => {
    rpcVs.mkdir('/test/path', {});
    expect(rpcVs.rpc).toHaveBeenCalledWith('mkdir', ['/test/path', {}]);
  });

  it('move uses an rpc call', () => {
    rpcVs.move('/test/from', '/test/to');
    expect(rpcVs.rpc).toHaveBeenCalledWith('move', ['/test/from', '/test/to']);
  });

  it('remove uses an rpc call', () => {
    rpcVs.remove('/test/path', true);
    expect(rpcVs.rpc).toHaveBeenCalledWith('delete', ['/test/path', true]);
  });

  it('remove uses an rpc call default', () => {
    rpcVs.remove('/test/path');
    expect(rpcVs.rpc).toHaveBeenCalledWith('delete', ['/test/path', false]);
  });

  it('rename uses an rpc call', () => {
    rpcVs.rename('/test/path', 'new name');
    expect(rpcVs.rpc).toHaveBeenCalledWith('rename', ['/test/path', 'new name']);
  });

  it('revoke uses an rpc call', () => {
    rpcVs.revoke('/test/path', 'priv', 'user', true);
    expect(rpcVs.rpc).toHaveBeenCalledWith('revoke', ['/test/path', 'priv', 'user', true]);
  });

  it('revoke uses an rpc call default', () => {
    rpcVs.revoke('/test/path', 'priv', 'user');
    expect(rpcVs.rpc).toHaveBeenCalledWith('revoke', ['/test/path', 'priv', 'user', false]);
  });

  it('show uses an rpc call', () => {
    rpcVs.show('/test/path');
    expect(rpcVs.rpc).toHaveBeenCalledWith('get', ['/test/path']);
  });
});
