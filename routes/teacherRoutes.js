const express = require('express');
const authController = require('../controllers/authController');
const scoreController = require('../controllers/scoreController');

const router = express.Router();

router.use(authController.protect);

// All routes restricted to teacher
router.use(authController.restrictTo('teacher'));

router.post('/student/:studentId', scoreController.createScoreCard);

router.get('/student/ranking', scoreController.getRanking);

module.exports = router;
