const config = require('../config');
const User = require('../model/user/user-schema');
const authUtils = require('./authUtils');

const frontURL = config.frontURL;
exports.signup = function (req, res) {
  const randomNumba = authUtils.generateCode(99999, 10000);
  const user = new User({
    name: req.body.name,
    id: req.body.id,
    email: req.body.email,
    password: req.body.password,
    isPswdReset: false,
    resetCode: randomNumba,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    interests: req.body.interests,
    affiliation: req.body.affiliation,
    expertise: req.body.expertise
  });
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (existingUser) { return res.status(409).send({ message: 'Email is already taken' }); }
    const validData = user.validateSignup();
    if (validData !== '') { return res.status(409).send({ message: validData }); }
    return user.save(() => {
      const mailbody = `<h1>Welcome ${user.name
      } to NDSSL.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" ` +
        `href="${frontURL}/userutil/?email=${user.email
        }">link</a>, then enter the following code to verify your email: <br><br><strong>${randomNumba}</strong></p>`;
      authUtils.sendEmail(mailbody, user.email, 'Verify Your Email Address');
      return res.status(201).json({ email: user.email });
    });
  });
};
exports.login = function (req, res) {
  // console.log('req body email' + req.body.email);
  // console.log('req body userid ' + req.body.id);
  let reqUserId = '';
  let reqUserEmail = '';
  reqUserId = authUtils.setIfExists(req.body.id);
  reqUserEmail = authUtils.setIfExists(req.body.email);
  User.findOne({ $or: [{ id: reqUserId }, { email: reqUserId }, { email: reqUserEmail }] }, '+password', (err, user) => {
    if (!user && reqUserId === '') {
      return res.status(401).json({ message: 'Wrong email address' });
    }
    if (!user && reqUserEmail === '') {
      return res.status(401).json({ message: 'Wrong email address or userid' });
    }
    if (user) {
      return authUtils.verifySaveUser(user, req, res);
    }
    return res.status(401).json({ message: 'unable to login, try again' });
  });
};
exports.validemail = function (req, res) {
  console.log(`email:${req.body.email} resetCode:${req.body.resetCode}`);
  User.findOne({ email: req.body.email, resetCode: req.body.resetCode }, (err, user) => {
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'incorrect email or code' });
    }
    user.resetCode = '';
    user.isPswdReset = false;
    return user.save(() => {
      res.status(201).json({ success: true });
    });
  });
};
exports.resetpass = function (req, res) {
  User.findOne({ $or: [{ email: req.body.email }, { id: req.body.email }] }, (err, user) => {
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'incorrect email address' });
    }
    const randomNumba = authUtils.generateCode(99999, 10000);
    user.resetCode = randomNumba;
    user.isPswdReset = true;
    return user.save(() => {
      res.status(201).json({ email: user.email });
      const mailBody = `<h1>A NDSSL Password Reset was Requested for ${user.name
      }.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="${
        frontURL}/userutil/?email=${user.email}&form=reset">` +
      `link</a>, then enter the following code to reset your password: <br><br><strong>${randomNumba
      }</strong></p><p><i>If a reset was requested in error, you can ignore this email and login to NDSSL as usual.</i></p>`;
      authUtils.sendEmail(mailBody, user.email, 'Password Reset');
    });
  });
};
exports.passwdreset = function (req, res) {
  console.log(`email:${req.body.email} resetCode:${req.body.resetCode}`);
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
    return user.save(() => {
      res.status(201).json({ success: true });
    });
  });
};
exports.changeemail = function (req, res) {
  console.log('request to change the email address');
  authUtils.checkEmailSyntax(req, res);
  User.findOne({ email: req.body.changeemail }, (err, user) => {
    if (user) {
      return res.status(409).json({ message: 'Email address already exists' });
    }
    return User.findOne({ email: req.body.email }, (error, existinguser) => {
      if (!existinguser) {
        return res.status(409).json({ message: 'current user does not exist' });
      }
      existinguser.resetCode = authUtils.generateCode(99999, 10000);
      existinguser.changeemail = req.body.changeemail;
      return existinguser.save(() => {
        console.log(existinguser);
        res.status(201).json({ success: true });
        const mailBody = `<h1>An Email Address Change was Requested for ${existinguser.name
        }.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="${
          frontURL}/userutil/?changeemail=${existinguser.changeemail}">` +
        `link</a>, then enter the following code to validate this new email: <br><br><strong>${
          existinguser.resetCode}</strong></p><p><i>If this reset was requested in error, you can ignore it and login to NDSSL as usual.</i></p>`;
        authUtils.sendEmail(mailBody, existinguser.changeemail, 'Email Change Request');
      });
    });
  });
};
exports.updateemail = function (req, res) {
  console.log('validate with pin then change the email address');
  authUtils.checkEmailSyntax(req, res);
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.status(409).json({ message: 'User does not exist' });
    }
    if (user.resetCode !== req.body.resetCode) {
      return res.status(409).json({ message: 'Reset code is wrong' });
    }
    if (user.changeemail !== req.body.changeemail) {
      return res.status(409).json({ message: 'Reset email is not valid' });
    }
    user.resetCode = '';
    user.email = req.body.changeemail;
    user.changeemail = '';
    return user.save(() => {
      res.status(201).json({ success: true });
    });
  });
};
