const { Router } = require('express');
const studentsController = require('../controllers/students.controller');
const createStudentSchema = require('../schemas/students/createStudent.schema');
const updateStudentSchema = require('../schemas/students/updateStudent.schema');
const createEnrollmentSchema = require('../schemas/students/createEnrollment.schema');
const validate = require('../middlewares/validateSchema.middleware');
const asyncHandler = require('../utils/asyncHandler');

const studentsRouter = Router();

// concentra os endpoints de alunos usados pela area administrativa
studentsRouter.get('/:id', asyncHandler(studentsController.getStudentProfile));
studentsRouter.patch('/:id', validate(updateStudentSchema), asyncHandler(studentsController.updateStudent));
studentsRouter.get('/', asyncHandler(studentsController.listStudents));
studentsRouter.post('/', validate(createStudentSchema), asyncHandler(studentsController.createStudent));
studentsRouter.post('/:id', validate(createEnrollmentSchema), asyncHandler(studentsController.createEnrollment));
studentsRouter.delete('/:id', asyncHandler(studentsController.deleteStudent));

module.exports = studentsRouter;
