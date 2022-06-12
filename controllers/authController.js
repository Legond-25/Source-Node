const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1.) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2.) Check if user exists and password is correct
  const user =
    (await User.findOne({ email }).select('+password')) ||
    (await Teacher.findOne({ email }).select('+password')) ||
    (await Student.findOne({ email }).select('+password'));

  if (!user) {
    return next(new AppError('User does not exist', 401));
  }

  if (!(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3.) Send JSON web token back to client, if everything is ok
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1.) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access.', 401)
    );
  }

  // 2.) Verification: Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.) Check if user still exists
  const currentUser =
    (await User.findById(decoded.id)) ||
    (await Teacher.findById(decoded.id)) ||
    (await Student.findById(decoded.id));

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, there will be no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1.) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2.) Check if user still exists
      const currentUser =
        (await User.findById(decoded.id)) ||
        (await Teacher.findById(decoded.id)) ||
        (await Student.findById(decoded.id));

      if (!currentUser) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    next();
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1.) Get user from collection
  const user =
    (await User.findById(req.user._id).select('+password')) ||
    (await Teacher.findById(req.user._id).select('+password')) ||
    (await Student.findById(req.user._id).select('+password'));

  // 2.) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3.) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended

  // 4.) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
