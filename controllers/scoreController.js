const Score = require('./../models/scoreModel');
const Student = require('./../models/studentModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create Score Card Function
exports.createScoreCard = catchAsync(async (req, res, next) => {
  const teacher = req.user.id;
  const student = req.params.studentId;

  if (!teacher || !student) {
    return next(new AppError('Teacher or student id is not present', 400));
  }

  req.body.teacher = teacher;
  req.body.student = student;

  const scoreCard = await Score.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      scoreId: scoreCard._id,
      message: 'Score card created successfully',
    },
  });
});

// Get Score Card Function
exports.getScoreCards = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;

  const student = await Student.findById(studentId).populate({
    path: 'scoreCards',
    select: 'score subject',
  });

  if (!student) {
    return next(new AppError('Student does not exist', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      studentId,
      scoreCard: student.scoreCards.map((card) => {
        return {
          subject: card.subject,
          score: card.score,
        };
      }),
    },
  });
});

// Get Ranking Function
exports.getRanking = catchAsync(async (req, res, next) => {
  const ranking = await Student.aggregate([
    {
      $unwind: '$scoreCards',
    },
    {
      $lookup: {
        from: 'scores',
        localField: 'scoreCards',
        foreignField: '_id',
        as: 'scoreDocs',
      },
    },
    {
      $unwind: '$scoreDocs',
    },
    {
      $group: {
        _id: '$name',
        percentage: { $avg: '$scoreDocs.score' },
      },
    },
    {
      $addFields: { name: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { totalScore: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      ranking,
    },
  });
});
