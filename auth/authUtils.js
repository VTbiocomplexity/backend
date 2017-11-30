const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const crypto = require('crypto');
const fs = require('fs');

class AuthUtils {
  static createJWT(user) {
    const payload = {
      sub: user._id,
      iat: moment().unix(),
      exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.hashString);
  }

  static handleError(res, err) {
    return res.send(400, err);
  }

  static ensureAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    const token = req.headers.authorization.split(' ')[1];
    let payload = null;
    try {
      payload = jwt.decode(token, config.hashString);
    } catch (err) {
      return res.status(401).send({ message: err.message });
    }
    req.user = payload.sub;
    next();
  }

  static sendEmail(bodyhtml, toemail, subjectline) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vt.biocomplexity@gmail.com',
        pass: config.gmailpassword
      }
    });

    const mailOptions = {
      from: 'vt.biocomplexity@gmail.com',
      to: toemail,
      subject: subjectline,
      html: bodyhtml
    };
    transporter.sendMail(mailOptions, (error, info) => {
    });
  }

  static generateCode(hi, low) {
    const min = Math.ceil(low);
    const max = Math.floor(hi);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static verifySaveUser(user, req, res) {
    let hascode = false;
    let hasnewemail = false;
    if (user.resetCode !== '' && user.resetCode !== null && user.resetCode !== undefined) {
      hascode = true;
    }
    if (user.changeemail !== null && user.changeemail !== '' && user.changeemail !== undefined) {
      hasnewemail = true;
    }
    // this means it is a brand new email to be verified
      if (hascode && !user.isPswdReset && !hasnewemail) {
        return res.status(401).json({ message: 'Validate your email address or click forgot password link to reset' });
      }
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) { return res.status(401).json({ message: 'Wrong password' }); }
      this.saveSendToken(user, req, res);
    });
  }

  static saveSendToken(user, req, res) {
    const userToken = { token: this.createJWT(user), email: user.email };
    user.isPswdReset = false;
    user.resetCode = '';
    user.changeemail = '';
    user.save();
    this.createSession(user, userToken, req, res);
    // return res.send(userToken);
  }

static createSession(user, userToken, req, res) {
  delete user.password;
  delete user.resetCode;
  console.log('am i here yet');
  if (req.session === undefined) {
    req.session = { authorizationToken: '', save() {} };
  }
  req.session.authorizationToken = this.generateBearerToken(user);
  user.id += '@patricbrc.org';
  req.session.userProfile = user;
  console.log(req.session);
  req.session.save();
  return res.status(200).json(userToken);
}

static generateBearerToken(user) {
  let config2;
  /* eslint-disable */
  if (fs.existsSync('../../config')) {
    config2 = require('../../config'); // eslint-disable-line import/no-unresolved
    /* eslint-enable */
  } else {
    config2 = { get(item) { return '1234'; } };
  }
  const name = user.id;
  console.log('trying to set the userid: ' + name);
  const tokenid = uuid.v4().toString();
  const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
  const expiration = Math.floor(exp.valueOf() / 1000);
  const realm = config2.get('realm');
  const payload = [
    'un=' + name + '@' + realm, 'tokenid=' + tokenid,
    'expiry=' + expiration, 'client_id=' + name + '@' + realm,
    'token_type=Bearer', 'realm=' + realm
  ];
  payload.push('SigningSubject=' + config2.get('signingSubjectURL'));
  console.log('what is the signing pem?');
  console.log(SigningPEM);
//   if (typeof SigningPEM === 'undefined' || SigningPEM === null || !SigningPEM) {
//     console.log('trying to set a fake signing pem');
//     /* eslint-disable */
//     const f = __dirname + '/fake.pem';
// console.log(f);
//     // if (f.charAt(0) !== '/') {
//     //         f = __dirname + '/' + f;
//     // }
//     //const SigningPEM = fs.readFileSync(f);
//   }
    /* eslint-enable */
  const key = SigningPEM.toString('ascii');
  const sign = crypto.createSign('RSA-SHA1');
  sign.update(payload.join('|'));
  const signature = sign.sign(key, 'hex');
  const token = payload.join('|') + '|sig=' + signature;
  console.log('New Bearer Token: ', token);
  return token;
}

  static checkEmailSyntax(req, res) {
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.changeemail)) {
      return console.log('email is valid');
    }
    return res.status(409).json({ message: 'Email address is not a valid format' });
  }
  static setIfExists(item) {
    if (item !== '' && item !== null && item !== undefined) {
      return item;
  }
  return '';
  }
}


module.exports = AuthUtils;
