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
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      userDetails: req.body.userDetails,
      organization: req.body.organization,
      organisms: req.body.organisms
    });
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(user.email))  {
      console.log('email is valid');
    } else {
      return res.status(409).send({ message: 'Email address is invalid format' });
    }
    if (user.password.length < 8) {
      return res.status(409).send({ message: 'Password is not min 8 characters' });
    }
    if (user.name === '' || user.name === null || user.name === undefined) {
      return res.status(409).send({ message: 'User Name is missing' });
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
    user.comparePassword(req.body.password, (err, isMatch) => {
      console.log(isMatch);
      if (!isMatch) {
        return res.status(401).json({ message: 'Wrong email and/or password' });
      }
      console.log(user);
      const userToken = { token: authUtils.createJWT(user) };
      console.log(userToken);
      res.send(userToken);
    });
  });
};
