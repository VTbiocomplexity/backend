
const User = require('../model/user/user-schema');
const authUtils = require('./authUtils');

exports.signup = function(req, res) {
  // let existingUser = false;
  const randomNumba = authUtils.generateCode(99999, 10000);
  const user = new User({
    name: req.body.name, id: req.body.id, email: req.body.email, password: req.body.password, isPswdReset: false, resetCode: randomNumba, first_name: req.body.first_name, last_name: req.body.last_name, interests: req.body.interests, affiliation: req.body.affiliation, organisms: req.body.organisms
  });
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (existingUser) { return res.status(409).send({ message: 'Email is already taken' }); }
    User.findOne({ id: req.body.id }, (err, existingUser2) => {
      if (existingUser2) { return res.status(409).send({ message: 'Userid is already taken' }); }
      const validData = user.validateSignup();
      if (validData !== '') { return res.status(409).send({ message: validData }); }
      user.save(() => {
        const mailbody = '<h1>Welcome ' + user.name + ' to PATRIC.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" ' +
        'href="' + process.env.FrontendUrl + '/userutil/?email=' + user.email + '">link</a>, then enter the following code to verify your email: <br><br><strong>' + randomNumba + '</strong></p>';
        authUtils.sendEmail(mailbody, user.email, 'Verify Your Email Address');
        return res.status(201).json({ email: user.email });
      });
    });
  });
};

exports.login = function(req, res) {
  // const founduser = false;
  console.log('req body email' + req.body.email);
  console.log('req body userid ' + req.body.id);
  let reqUserId = '';
  let reqUserEmail = '';
  if (req.body.id !== '' && req.body.id !== null && req.body.id !== undefined) {
    reqUserId = req.body.id;
  }
  if (req.body.email !== '' && req.body.email !== null && req.body.email !== undefined) {
    reqUserEmail = req.body.email;
  }
  // console.log(reqUserId);
  // the '+password' is used during the comparePassword function
  User.findOne({ $or: [{ id: reqUserId }, { email: reqUserId }, { email: reqUserEmail }] }, '+password', (err, user) => {
    if (!user && reqUserId === '') {
      return res.status(401).json({ message: 'Wrong email address' });
    }
    if (!user && reqUserEmail === '') {
      return res.status(401).json({ message: 'Wrong email address or userid' });
    }
    if (user) {
      // founduser = true;
      authUtils.verifySaveUser(user, req, res);
      //   if (user.resetCode !== '' && user.resetCode !== null && user.resetCode !== undefined) {
      //     if (!user.isPswdReset) {
      //       return res.status(401).json({ message: 'Validate your email address or click forgot password link to reset' });
      //     }
      //   }
      //   user.comparePassword(req.body.password, (err, isMatch) => {
      //     if (!isMatch) { return res.status(401).json({ message: 'Wrong password' }); }
      //     const userToken = { token: authUtils.createJWT(user) };
      //     res.send(userToken);
      //     user.isPswdReset = false;
      //     user.resetCode = '';
      //     user.save();
      //   });
    } else {
      return res.status(401).json({ message: 'unable to login, try again' });
    }
  });
  // if (!founduser && reqUserId !== '') {
  // the '+password' is used during the comparePassword function
  // User.findOne({ $or: [{ id: reqUserId }, { email: reqUserId }], {email: reqUserEmail} }, '+password', (err, user) => {
  // if (user) {
  // authUtils.verifySaveUser(user, req, res);
  // founduser = user;
  // if (user.resetCode !== '' && user.resetCode !== null && user.resetCode !== undefined) {
  //   if (!user.isPswdReset) {
  //     return res.status(401).json({ message: 'Validate your email address or click forgot password link to reset' });
  //   }
  // }
  // user.comparePassword(req.body.password, (err, isMatch) => {
  //   if (!isMatch) {
  //     return res.status(401).json({ message: 'Wrong password' });
  //   }
  //   const userToken = { token: authUtils.createJWT(user) };
  //   res.send(userToken);
  //   user.isPswdReset = false;
  //   user.resetCode = '';
  //   user.save();
  // });
  // } else {
  // return res.status(401).json({ message: 'Userid does not exist' });
  // }
  // });
  // }
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
    // const min = Math.ceil(10000);
    // const max = Math.floor(99999);
    const randomNumba = authUtils.generateCode(99999, 10000);
    user.resetCode = randomNumba;
    user.isPswdReset = true;
    user.save((err) => {
      res.status(201).json({ success: true });
      const mailBody = '<h1>A PATRIC Password Reset was Requested for ' + user.name + '.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="' +
      process.env.FrontendUrl + '/userutil/?email=' + user.email + '">' +
      'link</a>, then enter the following code to reset your password: <br><br><strong>' + randomNumba + '</strong></p><p><i>If a reset was requested in error, you can ignore this email and login to PATRIC as usual.</i></p>';
      authUtils.sendEmail(mailBody, user.email, 'Password Reset');
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

exports.changeemail = function(req, res) {
  console.log('request to change the email address');
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.changeemail)) {
    console.log('email is valid');
  } else {
    return res.status(409).json({ message: 'Email address is not a valid format' });
  }
  User.findOne({ email: req.body.changeemail }, (err, user) => {
    if (user) {
      return res.status(409).json({ message: 'Email address already exists' });
    }
    User.findOne( { email: req.body.email }, (err, existinguser) => {
      if (!existinguser) {
        return res.status(409).json({ message: 'current user does not exist' });
      }
      existinguser.resetCode = authUtils.generateCode(99999, 10000);
      existinguser.changeemail = req.body.changeemail;
      existinguser.save((err) => {
        console.log(existinguser);
        res.status(201).json({ success: true });
        const mailBody = '<h1>A PATRIC Email Address Change was Requested for ' + existinguser.name + '.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="' +
        process.env.FrontendUrl + '/userutil/?changeemail=' + existinguser.changeemail + '">' +
        'link</a>, then enter the following code to validate this new email: <br><br><strong>' + existinguser.resetCode + '</strong></p><p><i>If this reset was requested in error, you can ignore it and login to PATRIC as usual.</i></p>';
        authUtils.sendEmail(mailBody, existinguser.changeemail, 'Email Change Request');
      });
    });
  });
};

exports.updateemail = function(req, res) {
  console.log('validate with pin then change the email address');
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.changeemail)) {
    console.log('email is valid');
  } else {
    return res.status(409).json({ message: 'Email address is not a valid format' });
  }
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
    // User.findOne( { email: req.body.email }, (err, existinguser) => {
    //   if (!existinguser) {
    //     return res.status(409).json({ message: 'current user does not exist' });
    //   }
      user.resetCode = '';
      user.email = req.body.changeemail;
      user.changeemail = '';
      existinguser.save((err) => {
        console.log(existinguser);
        res.status(201).json({ success: true });
        // const mailBody = '<h1>A PATRIC Email Address Change was Requested for ' + existinguser.name + '.</h1><p>Click this <a style="color:blue; text-decoration:underline; cursor:pointer; cursor:hand" href="' +
        // process.env.FrontendUrl + '/userutil/?changeemail=' + existinguser.changeemail + '">' +
        // 'link</a>, then enter the following code to validate this new email: <br><br><strong>' + existinguser.resetCode + '</strong></p><p><i>If this reset was requested in error, you can ignore it and login to PATRIC as usual.</i></p>';
        // authUtils.sendEmail(mailBody, existinguser.changeemail, 'Email Change Request');
      });
    // });
  });
};
