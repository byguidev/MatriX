const { Router } = require('express');
const enrollmentsController = require('../controllers/enrollments.controller');
const createEnrollmentSchema = require('../schemas/students/createEnrollment.schema');
const changeEnrollmentStatusSchema = require('../schemas/enrollments/changeEnrollmentStatus.schema');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateSchema.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const enrollmentsRouter = Router();

enrollmentsRouter.get('/:id', authMiddleware, asyncHandler(enrollmentsController.listEnrollments));
enrollmentsRouter.post('/:id', authMiddleware, validate(createEnrollmentSchema), asyncHandler(enrollmentsController.createEnrollment));
enrollmentsRouter.patch('/:id', authMiddleware, validate(changeEnrollmentStatusSchema), asyncHandler(enrollmentsController.changeEnrollmentStatus));

module.exports = enrollmentsRouter;
