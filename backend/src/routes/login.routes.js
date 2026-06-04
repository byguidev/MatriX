const { Router } = require('express');
const loginController = require('../controllers/login.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateSchema.middleware');

const loginRouter = Router();

loginRouter.post("/", asyncHandler(loginController.login));

module.exports = loginRouter;
