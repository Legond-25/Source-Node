const mongoose = require('mongoose');

// Class Schema Design
const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Please provide a class name'],
      trim: true,
    },
    grade: {
      type: Number,
      trim: true,
      required: [true, 'Please provide a grade'],
    },
    capacity: {
      type: Number,
      trim: true,
      required: [true, 'Please provide a capacity'],
    },
    teachers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher',
      },
    ],
    students: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// For referencing data Query Middleware
classSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'teachers',
    select: 'name email',
  }).populate({
    path: 'students',
    select: 'name email',
  });
  next();
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
