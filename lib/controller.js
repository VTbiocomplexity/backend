const mongoose = require('mongoose');

class Controller {
  constructor(model) {
    this.model = model;
  }
  findById(req, res) {
    // only currently used to find the user by id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({
        message: 'Find id is invalid'
      });
    }
    return this.model.findById(req.params.id)
      .then((doc) => {
        if (!doc) { return res.status(404).end(); }
        return res.status(200).json(doc);
      });
  }
  update(req, res) {
    const conditions = { _id: req.params.id };
    const userTypes = JSON.parse(process.env.userRoles).roles;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({
        message: 'Update id is invalid'
      });
    }
    if (req.body.userType && userTypes.indexOf(req.body.userType) === -1) {
      return res.status(404).send({ message: 'userType not valid' });
    }
    if (req.body.name === '') {
      return res.status(400).send({ message: 'Name is required' });
    }
    return this.model.update(conditions, req.body)
      .then(doc =>
        // console.log(doc);
        res.status(200).json(doc));
  }

  findByIdAndRemove(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({
        message: 'Delete id is invalid'
      });
    }
    return this.model.findByIdAndRemove(req.params.id)
      .then((doc) => {
        if (!doc) {
          return res.status(404).send({ message: 'Delete id is invalid' });
        }
        return res.status(204).end();
      });
  }
}

module.exports = Controller;
