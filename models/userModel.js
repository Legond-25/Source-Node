const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Admin Schema Design
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'admin',
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Document middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hashing the password with cost of 12 using (bcrypt)
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Query middleware
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance Methods - will be available on all documents of the schema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Admin = mongoose.model('Admin', userSchema);
module.exports = Admin;
