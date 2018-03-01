const request = require('request');
const VolumeService = require('node-rafter').VolumeService;
const accessTokenUrl = 'https://rafter.bi.vt.edu/usersvc/login';
let vs;

class RC {
static initVolS(req, res) {
  // console.log(req.body.token);
  // /* istanbul ignore else */
  // if (req.body.init !== null && req.body.init !== undefined) {
  //   vs = req.body.init;
  // } else {
  vs = new VolumeService('https://rafter.bi.vt.edu/volumesvc/', req.body.token);
// }
  vs.init();
  return res.status(200).json({ home: true });
}
static runVolumeService(req, res) {
// static runVolumeService(req, res, init = null) {
  /* istanbul ignore else */
  if (req.body.init !== null && req.body.init !== undefined) {
    vs = req.body.init;
  }
  // console.log(req.body.token);
  console.log('this is your command: ' + req.body.command);
  if (req.body.command !== 'ls' && (req.body.rafterFile.name === '' || req.body.rafterFile.name === null || req.body.rafterFile.name === undefined)) {
    return res.status(400).json({ error: 'Invalid request: missing file/folder name' });
  }
  // vs = new VolumeService('https://rafter.bi.vt.edu/volumesvc/', req.body.token);
  // console.log(vs);
  // vs.init();
  if (req.body.command === 'ls') {
    vs.list('/home/' + req.body.userName + req.body.rafterFile.path).then((dir) => {
      console.log(dir);
      return res.json(dir);
    }).catch((err) => {
      console.log(err);
      return res.json(err);
    });
  } else if (req.body.command === 'create' && req.body.rafterFile.createType === 'file') {
  vs.create('/home/' + req.body.userName + req.body.rafterFile.path + '/', { name: req.body.rafterFile.name }).then((data) => {
    console.log(data);
    return res.json(data);
  }).catch((err) => {
    console.log(err);
    return res.json(err);
  });
} else if (req.body.command === 'create' && req.body.rafterFile.createType === 'folder') {
  console.log(req.body.rafterFile.name);
  vs.mkdir('/home/' + req.body.userName + '/' + req.body.rafterFile.name, { recursive: true }).then((data) => {
    console.log(data);
    return res.json(data);
  }).catch((err) => {
    console.log(err);
    return res.json(err);
  });
  }  else {
    return res.status(400).json({ error: 'invalid request' });
  }
  // vs = '';
  // return res.json(vs);
}

static rlogin(req, res) {
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
}
}
module.exports = RC;
