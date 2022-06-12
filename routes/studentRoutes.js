const express = require('express');
const authController = require('../controllers/authController');
const scoreController = require('../controllers/scoreController');

const router = express.Router();

// Get Score Card route restricted only for students
router.get(
  '/score',
  authController.protect,
  authController.restrictTo('student'),
  scoreController.getScoreCards
);

module.exports = router;
