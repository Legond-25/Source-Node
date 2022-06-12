const User = require('../models/userModel');
const Teacher = require('./../models/teacherModel');
const Student = require('./../models/studentModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

// Admin Controllers
exports.getMe = async (req, res, next) => {
  const doc = await User.findById(req.user._id);

  if (!doc) {
    return next(
      new AppError('A document with that ID could not be found', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: { data: doc }, // Found Doc
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1.) Create error if user POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2.) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Admin Teacher Controllers
exports.getAllTeachers = factory.getAll(Teacher);
exports.getTeacher = factory.getOne(Teacher, '', {
  value: 'Teacher',
});
exports.createTeacher = factory.createOne(Teacher, {
  value: 'Teacher',
});
exports.updateTeacher = factory.updateOne(Teacher, {
  value: 'Teacher',
});
exports.deleteTeacher = factory.deleteOne(Teacher, {
  value: 'Teacher',
});

// Admin Student Controllers
exports.getAllStudents = factory.getAll(Student);
exports.getStudent = factory.getOne(Student, '', {
  value: 'Student',
});
exports.createStudent = factory.createOne(Student, {
  value: 'Student',
});
exports.updateStudent = factory.updateOne(Student, {
  value: 'Student',
});
exports.deleteStudent = factory.deleteOne(Student, {
  value: 'Student',
});
