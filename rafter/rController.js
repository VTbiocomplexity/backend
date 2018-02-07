const request = require('request');

const accessTokenUrl = 'https://rafter.bi.vt.edu/usersvc/login';

exports.rlogin = function(req, res) {
  console.log(req.body.id);
  const myID = encodeURIComponent(req.body.id);
  const myPassword = encodeURIComponent(req.body.password);
  const fetchData = {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
     },
     body: 'id=' + myID + '&password=' + myPassword
   };
   // console.log(fetchData);
  request(accessTokenUrl, fetchData, (err, response, body) => {
    // console.log('this is the body from initial request ' + body);
    // console.log(response);
  const resData = response.toJSON();
    // console.log('this is the status code ' + resData.statusCode);
      // console.log('this is the cookie ' + resData.headers['set-cookie']);
      const sendCookie  = resData.headers['set-cookie'];
      // sendCookie = sendCookie.replace('connect.sid=', '');
      // const cookieObj = { cookie: sendCookie };
      // cookieObj = JSON.stringify(cookieObj);
  // return res.status(200).json(body);
  if (resData.statusCode === 301) {
    const data2 = {
      method: 'GET',
      headers: {
        Cookie: sendCookie[0]
      }
    };
    request('https://rafter.bi.vt.edu/usersvc/', data2, (err, response, body) => {
      console.log('trying to get the token now');
      return res.json(body);
    });
    // return res.status(200).json(sendCookie);
  } else {
    // console.log(body);
    return res.status(400).json(body);
  }
});
  // console.log('req body email' + req.body.email);
  // console.log('req body userid ' + req.body.id);
  // let reqUserId = '';
  // let reqUserEmail = '';
  //   reqUserId = authUtils.setIfExists(req.body.id);
  //   reqUserEmail = authUtils.setIfExists(req.body.email);
  // User.findOne({ $or: [{ id: reqUserId }, { email: reqUserId }, { email: reqUserEmail }] }, '+password', (err, user) => {
  //   if (!user && reqUserId === '') {
  //     return res.status(401).json({ message: 'Wrong email address' });
  //   }
  //   if (!user && reqUserEmail === '') {
  //     return res.status(401).json({ message: 'Wrong email address or userid' });
  //   }
  //   if (user) {
  //     authUtils.verifySaveUser(user, req, res);
  //   } else {
  //     return res.status(401).json({ message: 'unable to login, try again' });
  //   }
  // });
};
