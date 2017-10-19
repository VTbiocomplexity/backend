// const _ = require('lodash');
const User = require('../model/user/user-schema');
// const jwt = require('jwt-simple');
const authUtils = require('./authUtils');
exports.signup = function(req, res) {
  console.log('req body ' + req.body.email);
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }
    user.save(() => res.status(201).json({ token: authUtils.createJWT(user) }));
  });
};

exports.login = function(req, res) {
  console.log('req body ' + req.body.email);
  User.findOne({ email: req.body.email }, '+password', (err, user) => {
    if (!user) {
      return res.status(401).json({ message: 'Wrong email and/or password' });
    }
    console.log(user);
    const userToken = { token: authUtils.createJWT(user) };
    console.log(userToken);
    // user.comparePassword(req.body.password, (err, isMatch) => {
    //   if (!isMatch) {
    //     return res.status(401).send({ message: 'Wrong email and/or password' });
    //   }
      res.send(userToken);
    });
  // });
};
