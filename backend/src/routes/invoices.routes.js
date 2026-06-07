const { Router } = require('express');
const invoicesController = require('../controllers/invoices.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateSchema.middleware');
const changeInvoiceStatusSchema = require('../schemas/invoices/changeInvoiceStatus.schema');
const authMiddleware = require('../middlewares/auth.middleware');

const invoicesRouter = Router();

// lista e atualiza status de faturas
invoicesRouter.get('/', authMiddleware, asyncHandler(invoicesController.listInvoices));
invoicesRouter.patch('/:id', authMiddleware, validate(changeInvoiceStatusSchema), asyncHandler(invoicesController.changeInvoiceStatus));

module.exports = invoicesRouter;
