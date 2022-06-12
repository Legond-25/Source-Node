const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Teacher Schema Design
const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  mobile: {
    type: Number,
    unique: true,
    trim: true,
    required: [true, 'Please provide a mobile number'],
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el.toString(), 'en-IN');
      },
      message: 'Please enter a valid mobile number',
    },
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide a title'],
  },
  subject: {
    type: String,
    trim: true,
    required: [true, 'Please provide a subject'],
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'teacher',
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
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hashing the password with cost of 12 using (bcrypt)
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

// Query middleware
teacherSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance Methods - will be available on all documents of the schema
teacherSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
