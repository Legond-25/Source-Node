const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught Exception Handling
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 🎇 Shutting down...');
  console.log(err);
  process.exit(1);
});

// Configuring Environment Variables
dotenv.config({
  path: './.env',
});

const app = require('./app');

// Connect to Database
const DB = process.env.DB;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database Connection Successful'));

// PORT
const port = process.env.PORT || 3000;

// Start the server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Unhandled Rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🎇 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

// Sigterm of heroku
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECIEVED. Shutting down gracefully!');
  server.close(() => {
    console.log('🎇 Process Terminated!');
  });
});
