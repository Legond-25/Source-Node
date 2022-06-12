const Class = require('./../models/classModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// Get All Classes Handler Function
exports.getAllClasses = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Class.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const classData = await features.query;

  if (!classData) {
    return next(new AppError('No classes found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: classData.length,
    data: classData,
  });
});

// Get One Class Handler Function
exports.getClass = catchAsync(async (req, res, next) => {
  const searchedClass = await Class.findById(req.params.classId);

  if (!searchedClass) {
    return next(new AppError('Class not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      classId: searchedClass._id,
      message: `Class ${searchedClass.className} is present`,
    },
  });
});

// Create Class Handler Function
exports.createClass = catchAsync(async (req, res, next) => {
  const newClass = await Class.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      classId: newClass._id,
      message: `Class ${newClass.className} created successfully`,
    },
  });
});

// Update Class Handler Function
exports.updateClass = catchAsync(async (req, res, next) => {
  const updatedClass = await Class.findByIdAndUpdate(
    req.params.classId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedClass) {
    return next(new AppError('Class not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      classId: updatedClass._id,
      message: `Class ${updatedClass.className} updated successfully`,
    },
  });
});

// Delete Class Handler Function
exports.deleteClass = catchAsync(async (req, res, next) => {
  const deletedClass = await Class.findByIdAndDelete(req.params.classId);

  if (!deletedClass) {
    return next(new AppError('Class not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      classId: deletedClass._id,
      message: `Class ${deletedClass.className} removed successfully`,
    },
  });
});

// Map To Class Handler Function
exports.mapToClass = (user) => {
  return catchAsync(async (req, res, next) => {
    const searchedClass = await Class.findById(req.params.classId);

    if (!searchedClass) {
      return next(new AppError('Class not found', 404));
    }

    if (req.params.teacherId && req.params.classId) {
      const teachers = [...searchedClass.teachers, req.params.teacherId];
      req.body.teachers = teachers;
    }

    if (req.params.studentId && req.params.classId) {
      const students = [...searchedClass.students, req.params.studentId];
      req.body.students = students;
    }

    const mapClass = await Class.findByIdAndUpdate(
      req.params.classId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!mapClass) {
      return next(new AppError('Class mapping failed', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        classId: mapClass._id,
        message: `${user} added to class ${mapClass.className} successfully`,
      },
    });
  });
};
