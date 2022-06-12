const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// Requiring files
const authRouter = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes');
const teacherRouter = require('./routes/teacherRoutes');
const studentRouter = require('./routes/studentRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Start express app
const app = express();
app.enable('trust-proxy');

// Implement CORS
app.use(cors());
app.options('*', cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security http headers
app.use(helmet({ contentSecurityPolicy: false }));

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression Middleware
app.use(compression());

// Home Page
app.get('/', (req, res) => {
  res.redirect('https://documenter.getpostman.com/view/16439158/Uz5Njt9N');
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users/admin', adminRouter);
app.use('/api/v1/users/teacher', teacherRouter);
app.use('/api/v1/users/student', studentRouter);

app.all('*', function (req, res, next) {
  next(
    new AppError(
      `Can't find the requested url ${req.originalUrl} on this server!`,
      404
    )
  );
});

// Global Error Handling
app.use(globalErrorHandler);

module.exports = app;
