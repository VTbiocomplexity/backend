const nodemailer = require('nodemailer');
const User = require('../model/user/user-schema');
// const jwt = require('jwt-simple');
const authUtils = require('./authUtils');
exports.signup = function(req, res) {
  console.log('req body ' + req.body.email);
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    const min = Math.ceil(10000);
    const max = Math.floor(99999);
    const randomNumba = Math.floor(Math.random() * (max - min)) + min;
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      isPswdReset: false,
      resetCode: randomNumba,
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
    user.save(() => {
      res.status(201).json({ email: user.email });
      // send an email to the user email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'vt.biocomplexity@gmail.com',
          pass: 'Googlei5Fun!'
        }
      });

      const mailOptions = {
        from: 'vt.biocomplexity@gmail.com',
        to: user.email,
        subject: 'Verify Your Email Address',
        html: '<h1>Welcome ' + user.name + ' to PATRIC.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="http://localhost:3000/user/?email=' + user.email + '">' +
        'link</a>, then enter the following code to verify your email: <br><br><strong>' + randomNumba + '</strong></p>' // TODO localhost:3000 needs to be a variable for the url
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      // res.status(201).json({ token: authUtils.createJWT(user) }));
      // }

    });
  });
};

exports.login = function(req, res) {
  console.log('req body ' + req.body.email);
  User.findOne({ email: req.body.email }, '+password', (err, user) => {
    if (!user) {
      return res.status(401).json({ message: 'Wrong email and/or password' });
    }
    if (user.resetCode !== '' && user.resetCode !== null && user.resetCode !== undefined) {
      if (!user.isPswdReset) {
        return res.status(401).json({ message: 'Validate your email address or click forgot password link to reset' });
      }
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
      user.isPswdReset = false;
      user.resetCode = '';
      user.save();
    });
  });
};

exports.validemail = function(req, res) {
  console.log('email:' + req.body.email + ' resetCode:' + req.body.resetCode);
  User.findOne({ email: req.body.email, resetCode: req.body.resetCode }, (err, user) => {
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'incorrect email or code' });
    }
    user.resetCode = '';
    user.isPswdReset = false;
    user.save((err) => {
      res.status(201).json({ success: true });
    });
  });
};

exports.resetpass = function(req, res) {
  console.log('email:' + req.body.email);
  User.findOne({ email: req.body.email }, (err, user) => {
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'incorrect email address' });
    }
    const min = Math.ceil(10000);
    const max = Math.floor(99999);
    const randomNumba = Math.floor(Math.random() * (max - min)) + min;
    user.resetCode = randomNumba;
    user.isPswdReset = true;
    user.save((err) => {
      res.status(201).json({ success: true });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'vt.biocomplexity@gmail.com',
          pass: 'Googlei5Fun!'
        }
      });

      const mailOptions = {
        from: 'vt.biocomplexity@gmail.com',
        to: user.email,
        subject: 'Password Reset',
        html: '<h1>A PATRIC Password Reset was Requested for ' + user.name + '.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="http://localhost:3000/user/?email=' + user.email + '">' +
        'link</a>, then enter the following code to reset your password: <br><br><strong>' + randomNumba + '</strong></p><p><i>If a reset was requested in error, you can ignore this email and login to PATRIC as usual.</i></p>' // TODO localhost:3000 needs to be a variable for the url
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
  });
};

exports.passwdreset = function(req, res) {
  console.log('email:' + req.body.email + ' resetCode:' + req.body.resetCode);
  User.findOne({ email: req.body.email, resetCode: req.body.resetCode }, (err, user) => {
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'incorrect email or code' });
    }
    user.resetCode = '';
    user.isPswdReset = false;
    user.password = req.body.password;
    if (user.password.length < 8) {
      return res.status(401).send({ message: 'Password is not min 8 characters' });
    }
    user.save((err) => {
      res.status(201).json({ success: true });
    });
  });
};
