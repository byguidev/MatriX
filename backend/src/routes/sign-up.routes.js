const { Router } = require('express');
const signUpController = require('../controllers/signUp.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateSchema.middleware');
const userSchema = require('../schemas/signUp/signUp.schema');

const signUpRouter = Router();

signUpRouter.post("/", validate(userSchema), asyncHandler(signUpController.createUser));

module.exports = signUpRouter;