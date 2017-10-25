const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: false },
  firstname: { type: String, required: false },
  lastname: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false },
  resetCode: { type: String, required: false },
  isPswdReset: { type: Boolean, required: false },
  // isOhafUser: { type: Boolean, required: false },
  userPhone: { type: Number, required: false },
  userType: { type: String, required: false },
  userStreetAddress: { type: String, required: false },
  userCity: { type: String, required: false },
  userState: { type: String, required: false },
  userZip: { type: String, required: false },
  userDetails: { type: String, required: false },
  organization: { type: String, required: false },
  organisms: { type: String, required: false }
  // volTravelDistMiles: { type: Number, required: false },
  // volCauses: { type: [String], required: false },
  // volTalents: { type: [String], required: false },
  // volWorkPrefs: { type: [String], required: false },
  // volCauseOther:{ type: String, required: false },
  // volTalentOther:{ type: String, required: false },
  // volWorkOther:{ type: String, required: false }
});

userSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
          done(err, isMatch);
      });
};


module.exports = mongoose.model('User', userSchema);
