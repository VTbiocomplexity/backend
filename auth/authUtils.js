const moment = require('moment');
const jwt = require('jwt-simple');
const config = require('../config');
const nodemailer = require('nodemailer');

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
}

module.exports = AuthUtils;
