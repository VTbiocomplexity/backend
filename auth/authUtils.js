const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const nodemailer = require('nodemailer');
// const uuid = require('node-uuid');
// const crypto = require('crypto');

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
        pass: 'Googlei5Fun!'
      }
    });

    const mailOptions = {
      from: 'vt.biocomplexity@gmail.com',
      to: toemail,
      subject: subjectline,
      html: bodyhtml
    };
    transporter.sendMail(mailOptions, (error, info) => {
      // if (error) {
      // console.log(error);
      // } else {
      // console.log('Email sent: ' + info.response);
      // }
    });
  }
  static generateCode(hi, low) {
    const min = Math.ceil(low);
    const max = Math.floor(hi);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // static generateBearerToken(user, req) {
  //   const name = user.first_name + user.last_name;
  //   const tokenid = uuid.v4().toString();
  //   const exp = new Date();
  //   exp.setFullYear(exp.getFullYear() + 1);
  //   const expiration = Math.floor(exp.valueOf() / 1000);
  //   // const realm = config.get('realm');
  //   const payload = [
  //     'un=' + name + '@' + realm, 'tokenid=' + tokenid,
  //     'expiry=' + expiration, 'client_id=' + name + '@' + realm,
  //     'token_type=Bearer', 'realm=' + config.realm];
  //     payload.push('SigningSubject=' + config.signingSubjectURL);
  //     // const key = SigningPEM.toString('ascii');
  //     const sign = crypto.createSign('RSA-SHA1');
  //     sign.update(payload.join('|'));
  //     const signature = sign.sign(key, 'hex');
  //     const token = payload.join('|') + '|sig=' + signature;
  //     console.log('New Bearer Token: ', token);
  //     return token;
  //   }
  }

  module.exports = AuthUtils;
