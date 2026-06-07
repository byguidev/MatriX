const invoicesService = require('../services/invoices.service');

// lista todas as faturas ja com status sincronizado
async function listInvoices(req, res) {
    const invoices = await invoicesService.listInvoices(req.user.id);
    res.status(200).json(invoices);
}

// altera o status da fatura e sincroniza matricula relacionada
async function changeInvoiceStatus(req, res) {
    const updated = await invoicesService.changeInvoiceStatus(
        req.params.id,
        req.validatedData.body.status,
        req.user.id
    );
    res.status(200).json(updated);
}

module.exports = {
    listInvoices,
    changeInvoiceStatus,
};
