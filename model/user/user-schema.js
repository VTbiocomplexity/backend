const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  name: { type: String, required: true },
  id: {
    type: String, required: false, unique: true, sparse: true
  },
  first_name: { type: String, required: false },
  last_name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  changeemail: { type: String, required: false },
  password: { type: String, required: false, select: false },
  resetCode: { type: String, required: false },
  isPswdReset: { type: Boolean, required: false },
  primaryApp: { type: String, required: false },
  rafterApps: { type: Array, default: [], required: false },
  userPhone: { type: Number, required: false },
  userType: { type: String, required: false },
  userStreetAddress: { type: String, required: false },
  userCity: { type: String, required: false },
  userState: { type: String, required: false },
  userZip: { type: String, required: false },
  userDetails: { type: String, required: false },
  affiliation: { type: String, required: false },
  expertise: { type: String, required: false },
  roles: { type: [String], required: false },
  interests: { type: String, required: false },
  creationDate: { type: Date, required: false },
  updateDate: { type: Date, required: false },
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false }
});

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  return bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (error, hash) => {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, done) {
  // console.log('trying to compare a password now');
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

userSchema.methods.validateSignup = function () {
  let message = '';
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
    console.log('email is valid');
  } else {
    message = 'Email address is invalid format';
  }
  if (this.password.length < 8) {
    message = 'Password is not min 8 characters';
  }
  if (this.name === '' || this.name === null || this.name === undefined) {
    message = 'User Name is missing';
  }
  return message;
};

module.exports = mongoose.model('User', userSchema);
