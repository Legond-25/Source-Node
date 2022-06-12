const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Student Schema Design
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Please provide your email address'],
    unique: true,
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
  dob: {
    type: Date,
    required: [true, 'Please provide your birth date'],
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student',
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
  scoreCards: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Score',
    },
  ],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Document middleware
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hashing the password with cost of 12 using (bcrypt)
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

// Query middleware
studentSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

studentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'scoreCards',
    select: '-student',
  });

  next();
});

// Instance Methods - will be available on all documents of the schema
studentSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
