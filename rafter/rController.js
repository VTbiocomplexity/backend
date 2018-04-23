const request = require('request');
const VolumeService = require('node-rafter').VolumeService;
const User = require('../model/user/user-schema');
let vs;

class RC {
  static initVolS(req, res) {
    vs = new VolumeService('https://rafter.bi.vt.edu/volumesvc/', req.body.token);
    vs.init();
    return res.status(200).json({ home: true });
  }

  static runVolumeService(req, res) {
    /* istanbul ignore else */
    if (req.body.init !== null && req.body.init !== undefined) {
      vs = req.body.init;
    }
    console.log('this is your command: ' + req.body.command);
    if (req.body.command === 'create' && (req.body.rafterFile.name === '' || req.body.rafterFile.name === null || req.body.rafterFile.name === undefined)) {
      return res.status(400).json({ error: 'Invalid request: missing file/folder name' });
    }
    if (req.body.command === 'ls' && req.body.rafterFile.rfid === '') {
      vs.list('/home/' + req.body.userName + req.body.rafterFile.path).then(dir =>
        // console.log(dir);
         res.json(dir)).catch((err) => {
        console.log(err);
        return res.json(err);
      });
    }  else if (req.body.command === 'ls' && req.body.rafterFile.rfid !== '') {
      vs.list('/' + req.body.rafterFile.rfid).then(dir =>
        // console.log(dir);
         res.json(dir)).catch((err) => {
        console.log(err);
        return res.json(err);
      });
      } else if (req.body.command === 'remove') {
      console.log('line45');
      vs.remove('/' + req.body.fileID).then((data) => {
        console.log(data);
        return res.json(data);
      }).catch((err) => {
        console.log(err);
        return res.json(err);
      });
    } else if (req.body.command === 'get') {
      vs.get(req.body.fileID).then((file) => {
        console.log(file);
        res.setHeader('content-disposition', 'attachment; filename=filename.xml');
        return file.pipe(res);
      }).catch((err) => {
        console.log(err);
        return res.json(err);
      });
    // } else if (req.body.command === 'create' && req.body.rafterFile.createType === 'file' && req.body.rafterFile.rfid === '') {
    //   return res.json({ message:'create by id' });
    } else if (req.body.command === 'create' && req.body.rafterFile.createType === 'file') {
      vs.create('/home/' + req.body.userName + req.body.rafterFile.path + '/', { name: req.body.rafterFile.name, type: req.body.rafterFile.fileType }).then((data) => {
        // console.log(data);
        console.log('line 62');
        if (req.body.rafterFile.content !== null && req.body.rafterFile.content !== undefined && req.body.rafterFile.content !== '') {
          console.log('line 64');
          vs.put('/home/' + req.body.userName + req.body.rafterFile.path + '/' + req.body.rafterFile.name, req.body.rafterFile.content).then((data2) => {
            console.log('put file content into a file');
            // console.log(data2);
            return res.json(data2);
          }).catch((err2) => {
            console.log(err2);
            return res.json(err2);
          });
        }
        return res.json(data);
      }).catch((err) => {
        console.log(err);
        return res.json(err);
      });
    } else if (req.body.command === 'create' && req.body.rafterFile.createType === 'folder') {
      console.log('line79');
      const fullPath = '/home/' + req.body.userName + req.body.rafterFile.path + '/' + req.body.rafterFile.name;
      console.log(fullPath);
      vs.mkdir(fullPath, { recursive: true }).then(data =>
        // console.log(data);
         res.json(data)).catch((err) => {
        console.log(err);
        return res.json(err);
      });
    }  else {
      return res.status(400).json({ error: 'invalid request' });
    }
    // vs = '';
    // return res.json(vs);
  }

  static rinit(req, res) {
    console.log(req.body);
    const myId = req.body.id;
    const mySecret = req.body.secret;
    const myAppName = req.body.appName;
    const fetchData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      // body: JSON.stringify({ id: request.body.id, secret: request.body.secret })
      body: JSON.stringify({ secret: mySecret })
    };
    request('https://rafter.bi.vt.edu/usersvc/authenticate/' + myId, fetchData, (err, response, data) => {
      if (err) {
        res.json(err);
      } else {
        const filter = { _id: req.body.uid };
        User.findOne(filter, (err, existingUser) => {
          console.log(existingUser);
          if (existingUser) {
            console.log('user exists, yay!');
            /* istanbul ignore else */
            if (existingUser.rafterApps !== null && existingUser.rafterApps !== undefined) {
              console.log(existingUser.rafterApps);
              // push only if it is not already there add a checker here
              // let found = false;
              // let updateSecret = false;
              for (let i = 0; i < existingUser.rafterApps.length; i += 1) {
                if (existingUser.rafterApps[i].r_app_id === myId) {
                  // found = true;
                  console.log('I found an app id');
                  // if (existingUser.rafterApps[i].r_app_secret !== mySecret) {
                    existingUser.rafterApps.splice(i, 1);
                    // updateSecret = true;
                    console.log('change the app secret');
                    console.log(mySecret);
                    // found = false;
                  // }
                }
              }
              // if (!found) {
                existingUser.rafterApps.push({ r_app_id: myId, r_app_secret: mySecret, r_app_name: myAppName });
              // }
            } else {  // condition where rafterUser is not defined because user model was changed
              existingUser.rafterApps = [{ r_app_id: myId, r_app_secret: mySecret, r_app_name: myAppName }];
            }
            console.log(existingUser.rafterApps);
            existingUser.save(() => {
              res.json(data);
            });
          } else {
            res.status(400).json({ error:'rafter login failed' });
          }
        });
      }
    });
    // request.post(
    // 'https://rafter.bi.vt.edu/usersvc/authenticate/' + '?application_id=' + myId,
    // {
    // form: {secret: secret}
    // },

  }

  //   static rlogin(req, res) {
  //     console.log(req.body.id);
  //     const myID = encodeURIComponent(req.body.id);
  //     const myPassword = encodeURIComponent(req.body.password);
  //     const fetchData = {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded'
  //       },
  //       body: 'id=' + myID + '&password=' + myPassword
  //     };
  //     // console.log(fetchData);
  //     request(accessTokenUrl, fetchData, (err, response, body) => {
  //       // console.log('this is the body from initial request ' + body);
  //       // console.log(response);
  //       const resData = response.toJSON();
  //       console.log('this is the status code ' + resData.statusCode);
  //       console.log('this is the cookie ' + resData.headers['set-cookie']);
  //       const sendCookie  = resData.headers['set-cookie'];
  //       // sendCookie = sendCookie.replace('connect.sid=', '');
  //       // const cookieObj = { cookie: sendCookie };
  //       // cookieObj = JSON.stringify(cookieObj);
  //       // return res.status(200).json(body);
  //       if (resData.statusCode === 301) {
  //         const data2 = {
  //           method: 'GET',
  //           headers: {
  //             Cookie: sendCookie[0],
  //             Accept: 'application/json'
  //           }
  //         };
  //         request('https://rafter.bi.vt.edu/usersvc/application/', data2, (err, response) => {
  //           console.log('trying to get the token now');
  //           const appBody = JSON.parse(response.body);
  //           const myId = appBody[0].id;
  //           let myKey = appBody[0].access_token;
  //           console.log(myId);
  //           console.log(myKey);
  //           const myKey1 = cryptr(myKey, 'base64');
  //           console.log('line146');
  //           console.log(myKey1);
  //           // const data3 = {
  //           //   method: 'POST',
  //           //   headers: {
  //           //     Cookie: sendCookie[0],
  //           //     Accept: 'application/json'
  //           //     // 'Content-Type': 'application/json'
  //           //     // 'Content-Type': 'application/x-www-form-urlencoded'
  //           //   },
  //           //   form: { secret: myKey }
  //           //   // body: JSON.stringify({ secret: myKey })
  //           // };
  //           const url = 'https://rafter.bi.vt.edu/usersvc/authenticate/' + myId;
  //           // request('https://rafter.bi.vt.edu/usersvc/application/' + myId + '/', data3, (err, response2)  => {
  //           //   console.log('line 151');
  //           //   const appBody2 = JSON.parse(response2.body);
  //           //   console.log(appBody2);
  //           // });
  //           myKey = 'jAAPwgxQxYkJqGmxpEvVYyXXcyBt72M4';
  //           request.post(url,
  //             {
  //               headers: {
  //                 Cookie: sendCookie[0],
  //                 Accept: 'application/json',
  //               'Content-Type': 'application/json'
  //             },
  //             body: JSON.stringify({ secret: myKey })
  //           },
  //             (err, response, data) => {
  //               if (err) { return res.status(400).json(err); }
  //               console.log('token now?');
  //               console.log(data);
  //               return res.json(data);
  //             }
  //           );
  //
  //           // const applicationPage = response.toJSON();
  //           // console.log(applicationPage);
  //           // return res.json(body);
  //         });
  //         // return res.status(200).json(sendCookie);
  //       } else {
  //         // console.log(body);
  //         return res.status(400).json(body);
  //       }
  //     });
  //   }
}
module.exports = RC;
