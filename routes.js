const Router = require('express').Router;
const router = new Router();
const user = require('./model/user/user-router');
const auth = require('./auth');
const hello = require('./hello/index');
const rafter = require('./rafter/index');
const authUtils = require('./auth/authUtils');

module.exports = function (app) {
  app.use(router);
  router.use('/auth', auth);
  router.use('/hello', hello);
  router.use('/rafter', rafter);
  router.use('/user', authUtils.ensureAuthenticated, user);
};
