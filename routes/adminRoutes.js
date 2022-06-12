const express = require('express');
const userController = require('../controllers/userController');
const classController = require('../controllers/classController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes adter this middleware
router.use(authController.protect);

// Get All Students route restricted for only admins and teachers
router
  .route('/student')
  .get(
    authController.restrictTo('admin', 'teacher'),
    userController.getAllStudents
  )
  .post(authController.restrictTo('admin'), userController.createStudent);

// Restricted for only admins
router.use(authController.restrictTo('admin'));

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Admin Teacher Routes
router.patch(
  '/teacher/:teacherId/class/:classId',
  classController.mapToClass('Teacher')
);

router
  .route('/teacher')
  .get(userController.getAllTeachers)
  .post(userController.createTeacher);

router
  .route('/teacher/:teacherId')
  .get(userController.getTeacher)
  .patch(userController.updateTeacher)
  .delete(userController.deleteTeacher);

// Admin Student Routes
router.patch(
  '/student/:studentId/class/:classId',
  classController.mapToClass('Student')
);

router
  .route('/student/:studentId')
  .get(userController.getStudent)
  .patch(userController.updateStudent)
  .delete(userController.deleteStudent);

// Admin Class Routes
router
  .route('/class')
  .get(classController.getAllClasses)
  .post(classController.createClass);

router
  .route('/class/:classId')
  .get(classController.getClass)
  .patch(classController.updateClass)
  .delete(classController.deleteClass);

module.exports = router;
