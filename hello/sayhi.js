// const request = require('request');
class Sayhi {
  static hi(req, res) {
    // request.get((...args) => {
      res.send({ message: 'hello' });
    // });
  }
}
module.exports = Sayhi;
