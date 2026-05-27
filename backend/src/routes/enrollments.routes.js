const { Router } = require('express');
const enrollmentsController = require('../controllers/enrollments.controller');
const createEnrollmentSchema = require('../schemas/students/createEnrollment.schema');
const changeEnrollmentStatusSchema = require('../schemas/enrollments/changeEnrollmentStatus.schema');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateSchema.middleware');

const enrollmentsRouter = Router();

enrollmentsRouter.get('/:id', asyncHandler(enrollmentsController.listEnrollments));
enrollmentsRouter.post('/:id', validate(createEnrollmentSchema), asyncHandler(enrollmentsController.createEnrollment));
enrollmentsRouter.patch('/:id', validate(changeEnrollmentStatusSchema), asyncHandler(enrollmentsController.changeEnrollmentStatus));

module.exports = enrollmentsRouter;
