const rafter = require('../../rafter/rController');
// const User = require('../../model/user/user-schema');
// const jwt = require('jwt-simple');
// const config = require('../../config');
const nock = require('nock');

describe('The Unit Test for Rafter', () => {
  // let userid;

  before((done) => {
    // Set up an existing user
    // mockgoose(mongoose).then(() => {
    //   const user = new User();
    //   user.name = 'foo';
    //   user.email = 'foo@example.com';
    //   user.save((err) => {
    //     userid = user._id.toString();
         done();
    //   });
    // });
  });

  it('should login a rafter user', (done) => {
    // const sub = 'foo@example.com';
    // const cookie = { headers: { 'set-cookie': ['cookie'] } };
    nock('https://rafter.bi.vt.edu')
      .defaultReplyHeaders({
        'set-cookie':['cookie']
      })
      .post('/usersvc/login')
      .reply(301);
      // const response = { json() {} };
    const token = { token: '<div></div>' };
    nock('https://rafter.bi.vt.edu')
      .get('/usersvc/')
      .reply(200, token);

    const req = { body: { id:'yo', password: 'yo' } };
    const res = {
      // json() {},
      json: (msg) => {
        expect(msg).to.equal('{"token":"<div></div>"}');
        // const payload = jwt.decode(msg.token, config.hashString);
        // expect(payload.sub).to.equal(userid);
        done();
      }
    };

    rafter.rlogin(req, res);
  });

  it('should not login a rafter user', (done) => {
    // const sub = 'foo@example.com';
    // const cookie = { headers: { 'set-cookie': ['cookie'] } };
    nock('https://rafter.bi.vt.edu')
      .defaultReplyHeaders({
        'set-cookie':['cookie']
      })
      .post('/usersvc/login')
      .reply(400);
      // const response = { json() {} };
    const token = { token: '<div></div>' };
    nock('https://rafter.bi.vt.edu')
      .get('/usersvc/')
      .reply(200, token);

    const req = { body: { id:'yo', password: 'yo' } };
    const res = {
      // json() {},
      status: (code) => {
        expect(code).to.equal(400);
        // const payload = jwt.decode(msg.token, config.hashString);
        // expect(payload.sub).to.equal(userid);
        done();
      }
    };

    rafter.rlogin(req, res);
  });

  // it('should create a new user and authenticate', (done) => {
  //   const sub = 'foo2@example.com';
  //   const token = { access_token: 'access_token' };
  //   nock('https://accounts.google.com')
  //     .post('/o/oauth2/token')
  //     .reply(200, token);
  //
  //   const profile = { email: sub };
  //   nock('https://www.googleapis.com')
  //     .get('/plus/v1/people/me/openIdConnect')
  //     .reply(200, profile);
  //
  //   const req = { body: {} };
  //   const res = {
  //     send: (msg) => {
  //       expect(msg).to.have.property('token');
  //       // Make sure our token contains a new user id, different from existing userid
  //       const payload = jwt.decode(msg.token, config.hashString);
  //       expect(payload.sub).to.not.equal(userid);
  //       done();
  //     }
  //   };
  //
  //   google.authenticate(req, res);
  // });
});
