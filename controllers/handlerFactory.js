const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// Get All Handler Factory Function
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain(); Used for indexing purposes
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc, // Found all docs
    });
  });

// Get One Handler Factory Function
exports.getOne = (Model, popOptions, options) =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;

    if (options.value === 'Teacher') {
      id = req.params.teacherId;
    } else if (options.value === 'Student') {
      id = req.params.studentId;
    }

    let query = Model.findById(id);
    if (popOptions) {
      query = query.populate(popOptions);
    }

    console.log(Model.value);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError('A document with that ID could not be found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: doc._id,
        message: `${options.value} ${doc.name} is present`,
      }, // Found Doc
    });
  });

// Create One Handler Factory Function
exports.createOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    if (req.body.role) {
      return next(
        new AppError(
          `Unexpected field role:${req.body.role}. Please do not enter the role`,
          400
        )
      );
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        id: doc._id,
        message: `${options.value} ${doc.name} added successfully`,
      },
    });
  });

// Update One Handler Factory Function
exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    if (req.body.role) {
      return next(
        new AppError(
          `Unexpected field role:${req.body.role}. Please do not enter the role`,
          400
        )
      );
    }

    let id = req.params.id;

    if (options.value === 'Teacher') {
      id = req.params.teacherId;
    } else if (options.value === 'Student') {
      id = req.params.studentId;
    }

    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError('A document with that ID could not be found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: doc._id,
        message: `${options.value} ${doc.name} updated successfully`,
      },
    });
  });

// Delete One Handler Factory Function
exports.deleteOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;

    if (options.value === 'Teacher') {
      id = req.params.teacherId;
    } else if (options.value === 'Student') {
      id = req.params.studentId;
    }

    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      return next(
        new AppError('A document with that ID could not be found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        // Deleted Doc
        id: doc._id,
        message: `${options.value} ${doc.name} removed successfully`,
      },
    });
  });
