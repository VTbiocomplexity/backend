class RUtils {
  static handleRafterAppId(existingUser, myId, mySecret, myAppName) {
    for (let i = 0; i < existingUser.rafterApps.length; i += 1) {
      if (existingUser.rafterApps[i].r_app_id === myId) {
        existingUser.rafterApps.splice(i, 1);
      }
    }
    existingUser.rafterApps.push({ r_app_id: myId, r_app_secret: mySecret, r_app_name: myAppName });
    return existingUser;
  }
  static handleVsCreate(req, res, vs) {
    if (req.body.command === 'create' && (req.body.rafterFile.name === '' || req.body.rafterFile.name === null ||
    req.body.rafterFile.name === undefined)) {
      return res.status(400).json({ error: 'Invalid request: missing file/folder name' });
    } else if (req.body.command === 'create' && req.body.rafterFile.createType === 'file') {
      return vs.create(`/home/${req.body.userName}${req.body.rafterFile.path}/`, {
        name: req.body.rafterFile.name,
        type: req.body.rafterFile.fileType
      }).then((data) => {
        // console.log(data);
        // console.log('line 62');
        if (req.body.rafterFile.content !== null && req.body.rafterFile.content !== undefined && req.body.rafterFile.content !== '') {
          // console.log('line 64');
          vs.put(`/home/${req.body.userName}${req.body.rafterFile.path}/${req.body.rafterFile.name}`, req.body.rafterFile.content).then(data2 =>
            // console.log('put file content into a file');
            // console.log(data2);
            res.json(data2)).catch(err2 =>
          // console.log(err2);
            res.json(err2));
        }
        return res.json(data);
      }).catch(err =>
      // console.log(err);
        res.json(err));
    } else if (req.body.command === 'create' && req.body.rafterFile.createType === 'folder') {
      // console.log('line79');
      const fullPath = `/home/${req.body.userName}${req.body.rafterFile.path}/${req.body.rafterFile.name}`;
      // console.log(fullPath);
      return vs.mkdir(fullPath, { recursive: true }).then(data =>
      // console.log(data);
        res.json(data)).catch(err =>
        // console.log(err);
        res.json(err));
    }
    return res.status(400).json({ error: 'invalid request' });
  }
}
module.exports = RUtils;
