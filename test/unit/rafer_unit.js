const rafter = require('../../rafter/rController');
// const VolumeService = require('rafter').VolumeService;
const nock = require('nock');
// VolumeService.list = function() { return promise.resolve({ json: () => Promise.resolve({ name: 'filename' }) }); };
describe('The Unit Test for Rafter', () => {

  it('should login a rafter user', (done) => {
    nock('https://rafter.bi.vt.edu')
      .defaultReplyHeaders({
        'set-cookie':['cookie']
      })
      .post('/usersvc/login')
      .reply(301);
      const token = { token: '<div></div>' };
    nock('https://rafter.bi.vt.edu')
      .get('/usersvc/')
      .reply(200, token);
    const req = { body: { id:'yo', password: 'yo' } };
    const res = {
        json: (msg) => {
        expect(msg).to.equal('{"token":"<div></div>"}');
        done();
      }
    };
    rafter.rlogin(req, res);
  });

  it('should not login a rafter user', (done) => {
    nock('https://rafter.bi.vt.edu')
      .defaultReplyHeaders({
        'set-cookie':['cookie']
      })
      .post('/usersvc/login')
      .reply(400);
    const token = { token: '<div></div>' };
    nock('https://rafter.bi.vt.edu')
      .get('/usersvc/')
      .reply(200, token);
    const req = { body: { id:'yo', password: 'yo' } };
    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        done();
      }
    };
    rafter.rlogin(req, res);
  });
  it('initializes the volume service', async() => {
    const req = { body: { command: 'ls', token: 'token', userName: 'yoyo', rafterFile: { path: '/yo' } } };
    const res = {
      status(code) { return { json() {} }; }
      //   expect(code).to.equal(200);
      // }
    };
    // const init = { list() { return Promise.reject(new Error('fail')); } };
    // req.body.init = init;
    await rafter.initVolS(req, res);
    // expect(res.status)
  });
  it('tries to lists the contents of a directory but has an error', async() => {
    const req = { body: { command: 'ls', token: 'token', userName: 'yoyo', rafterFile: { path: '/yo' } } };
    const res = {
      status: (code) => {
        // expect(code).to.equal(200);
      }
    };
    const init = { list() { return Promise.reject(new Error('fail')); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('lists the contents of home directory', async() => {
    const req = { body: { command: 'ls', token: 'token', userName: 'yoyo', rafterFile: { path: '/yo' } } };
    const res = {
      json(item) {}
    };
    const init = { list() { return Promise.resolve({ name: 'filename' }); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('creates a new file', async() => {
    const req = { body: { command: 'create', token: 'token', userName: 'yoyo', rafterFile: { name: 'filename', createType: 'file' } } };
    const res = {
      json(item) {},
      status: (code) => {
        expect(code).to.equal(200);
        return { json(item) {} };
      }
    };
    const init = { create() { return Promise.resolve({ name: 'filename' }); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('tries to create a new file but has error', async() => {
    const req = { body: { command: 'create', token: 'token', userName: 'yoyo', rafterFile: { name: 'filename', createType: 'file' } } };
    const res = {
      json(item) {},
      status: (code) => {
        // expect(code).to.equal(400);
      }
    };
    const init = { create() { return Promise.reject(new Error('fail')); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('prevents creating a new file without a file name', async() => {
    const req = { body: { command: 'create', token: 'token', userName: 'yoyo', rafterFile: { name: '', createType: 'file' } } };
    const res = {
      json(item) {},
      status: (code) => {
        expect(code).to.equal(400);
        return { json(item) {} };
      }
    };
    const init = { create() { return Promise.resolve({ name: '' }); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('creates a new folder', async() => {
    const req = { body: { command: 'create', token: 'token', userName: 'yoyo', rafterFile: { name: 'filename', createType: 'folder' } } };
    const res = {
      json(item) {},
      status: (code) => {
        expect(code).to.equal(200);
        return { json(item) {} };
      }
    };
    const init = { mkdir() { return Promise.resolve({ name: 'filename' }); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('catches error on create new folder', async() => {
    const req = { body: { command: 'create', token: 'token', userName: 'yoyo', rafterFile: { name: 'filename', createType: 'folder' } } };
    const res = {
      json(item) {},
      status: (code) => {
        // expect(code).to.equal(200);
        // return { json(item) {} };
      }
    };
    const init = { mkdir() { return Promise.reject({ error: 'you fail' }); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });
  it('asks for a bogus volume service command', async() => {
    const req = { body: { command: 'bogas', token: 'token', userName: 'yoyo', rafterFile: { name: 'filename' } } };
    const res = {
      json(item) {},
      status: (code) => {
        expect(code).to.equal(400);
        return { json(item) {} };
      }
    };
    const init = { create() { return Promise.resolve({ error: 'you fail' }); } };
    req.body.init = init;
    await rafter.runVolumeService(req, res);
  });

});
