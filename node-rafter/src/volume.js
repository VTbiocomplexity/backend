const RafterService = require('./rafter');
const fetch = require('node-fetch');
const FormData = require('form-data');
const buildUrl = require('./util/buildUrl');
const { PassThrough } = require('stream');

class VolumeService extends RafterService {
  init() {
    let initUrl = buildUrl(this._url, 'initialize');
    return fetch(
      initUrl,
      {
        headers: {
          accept: "application/json",
          authorization: this._token
        }
      })
      .then(
        response => {
          if(!response.ok) throw new Error(response.statusText);
          return response.json();
        })
      .catch(err => Promise.reject(err));
  }
  
  list(path) {
    return this.rpc('ls', [path]);
  }
  
  chown(path, user, recursive=false) {
    return this.rpc('chown', [path, user, recursive]);
  }

  create(path, metadata) {
    let url = buildUrl(this._url, 'file', path);

    let data = new FormData()
    for (let key in metadata) {
      data.append(key, metadata[key]);
    }

    return fetch(url,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': this._token
        },
        body: data
      })
      .then(res => res.json());
  }

  find(path, query, recursive=false) {
    return this.rpc('find', [path, query, recursive]);
  }

  get(path) {
    let url = buildUrl(this._url, 'file', path);
    return fetch(url, 
      {
        headers: {
          accept: '*/*',
          authorization: this._token
        }
      })
      .then(res => {
        if(!res.ok) return Promise.reject(res.statusText);
        return res.body;
      });
  }

  grant(path, privs, user, recursive=false) {
    return this.rpc('grant', [path, privs, user, recursive]);
  }

  mkdir(path, options) {
    return this.rpc('mkdir', [path, options]);
  }

  move(from, to) {
    return this.rpc('move', [from, to]);
  }

  put(path, data) {
    let url = buildUrl(this._url, 'file', path);
    return fetch(
      url,
      {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'authorization': this._token
        },
        body: data
      })
      .then(res => {
        if(!res.ok) return Promise.reject(res.statusText); 

        return res.json();
      })
  }

  remove(path, recursive=false) {
    return this.rpc('delete', [path, recursive]);
  }

  rename(path, name) {
    return this.rpc('rename', [path, name]);
  }

  revoke(path, privs, user, recursive=false) {
    return this.rpc('revoke', [path, privs, user, recursive]); 
  }

  set(path) {
    let pairs = [...arguments].slice(1);

    let patches = pairs.map(pair => {
      if(pair.constructor != Array || pair.length != 2) {
        throw new TypeError('Each pair must be an Array of length 2.');
      }

      let key = pair[0];
      let val = pair[1];

      if(key === 'type') {
        return {
          op: 'replace',
          path: '/type',
          value: val
        }
      }

      if(key === 'public') {
        return {
          op: 'add',
          path: '/public',
          value: val
        }
      }

      return {
        op: 'add',
        path: '/usermeta/' + key,
        value: val
      }
    });

    return this.rpc('patch', [path, patches])
  }

  unset(path) {
    let patches = [...arguments]
      .slice(1)
      .map(key => {

        if(key === 'public') {
          return {
            op: 'remove',
            path: '/public'
          }
        }

        return {
          op: 'remove',
          path: '/usermeta/' + key,
        }
      });

    return this.rpc('patch', [path, patches])
  }

  show(path) {
    return this.rpc('get', [path]);
  }


  openWriteStream(newFile, opts, cb=null) {
    let targetPath = newFile.path;
    delete newFile.path;

    if(!targetPath) {
      throw new Error("Missing Target Path");
    }

    if(!newFile.name) {
      throw new Error("Missing File Name");
    }

    if(!newFile.type) {
      newFile.type = 'unspecified';
    }

    if (targetPath.charAt(targetPath.length-1)!="/") {
      targetPath = targetPath + "/";
    }

    let passthrough = new PassThrough();

    // Set up callback
    if (!cb) {
      cb = (err, body, stream) => {
        if(err) {
          /* FOR node v6.xx compatibility!!!
           * Check if stream has destroy. */
          if(typeof stream.destroy === 'function') stream.destroy(err);
          else {
            /* If stream does not have destroy, emit the error anyway so that
             * errors are delivered in a consistant way. */
            passthrough.emit('error', err);
            passthrough.emit('close', err);
          }
        }
      }
    }

    let mkdirOpts = { recursive: true };
    for(let k in opts) mkdirOpts[k] = opts[k];

    // Create the directory for our file
    this.mkdir(targetPath, mkdirOpts)

    // Create the file in that directory
      .then(folder => this.create(targetPath, newFile))

    // Write to file
      .then(res => this.put(targetPath + newFile.name, passthrough))
      
    // Call the callback
      .then(body => cb(null, body, passthrough))
      .catch(err => cb(err, null, passthrough));

    // Return the stream
    return passthrough;
  }
}

module.exports = VolumeService;
