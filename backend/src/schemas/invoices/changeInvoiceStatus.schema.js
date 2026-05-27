const { z } = require('zod');

const changeInvoiceStatusSchema = z.object({
    body: z.object({
        status: z.enum(["ABERTA", "VENCIDA", "PAGA"], { message: "Valor inválido" })
    }),
    params: z.object({
        id: z.string().min(1, "Id inválido"),
    })
});

module.exports = changeInvoiceStatusSchema;
