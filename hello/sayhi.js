// const authUtils = require('../auth/authUtils');
class Sayhi {
  static hi(req, res) {
    // request.get((...args) => {
    res.send({ message: 'hello' });
    // const user = {
    //   first_name: 'Joe',
    //   last_name: 'Smith'
    // };
    // authUtils.generateBearerToken(user, null);
    // });
  }
}
module.exports = Sayhi;
