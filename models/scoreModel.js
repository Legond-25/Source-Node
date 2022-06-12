const mongoose = require('mongoose');
const Student = require('./studentModel');

// Score Schema Design
const scoreSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      trim: true,
      required: [true, 'Please provide a subject'],
      enum: {
        values: ['English', 'Maths', 'Science', 'Social Science', 'IT'],
        message:
          'The subject can only be English, Maths, Science, Social Science, IT.',
      },
    },
    dateOfExam: {
      type: Date,
      required: [true, 'Please provide the date of exam'],
    },
    dateOfScore: {
      type: Date,
      default: Date.now(),
      required: [true, 'Please provide the date of score card'],
    },
    score: {
      type: Number,
      required: [true, 'Please provide a score (out of 100)'],
      min: [0, 'The score must be above 0'],
      max: [100, 'The score must be below 100'],
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'Score card must belong to a student'],
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'Teacher',
      required: [true, 'Score card must be given by a teacher'],
    },
    comments: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexing Better For Quering
scoreSchema.index({ subject: 1, student: 1 }, { unique: true });

// Static Method
scoreSchema.statics.addScoreCard = async function (studentId, scoreCard) {
  const student = await Student.findById(studentId);

  const scoreCards = [...student.scoreCards, scoreCard];

  await Student.findByIdAndUpdate(studentId, {
    scoreCards: scoreCards,
  });
};

// Document Middleware
scoreSchema.post('save', function () {
  this.constructor.addScoreCard(this.student, this);
});

// Query Middleware
scoreSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'student',
    select: 'name email',
  }).populate({
    path: 'teacher',
    select: 'name email',
  });

  next();
});

const Score = new mongoose.model('Score', scoreSchema);
module.exports = Score;
