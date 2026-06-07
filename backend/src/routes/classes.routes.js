const { Router } = require('express');
const classesController = require('../controllers/classes.controller');
const classesRouter = Router();
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/auth.middleware');

// concentra os endpoints de turmas usados pela area administrativa
classesRouter.get('/', authMiddleware, asyncHandler(classesController.listClasses));
classesRouter.get('/:id', authMiddleware, asyncHandler(classesController.getClassProfile));
classesRouter.post('/', authMiddleware, asyncHandler(classesController.createClass));
classesRouter.delete('/:id', authMiddleware, asyncHandler(classesController.deleteClass));
classesRouter.patch('/:id', authMiddleware, asyncHandler(classesController.updateClass));

module.exports = classesRouter;
