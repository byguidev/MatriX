const { Router } = require('express');
const enrollmentsController = require('../controllers/enrollments.controller');
const createEnrollmentSchema = require('../schemas/students/createEnrollment.schema');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateSchema.middleware');

const enrollmentsRouter = Router();

enrollmentsRouter.post('/:id', validate(createEnrollmentSchema), asyncHandler(enrollmentsController.createEnrollment));

module.exports = enrollmentsRouter;