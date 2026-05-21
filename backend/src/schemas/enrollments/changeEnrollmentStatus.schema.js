const { z } = require('zod');

const changeEnrollmentStatusSchema = z.object({
    body: z.object({
        status: z.enum(["ATIVA", "TRANCADA", "CANCELADA"], { message: "Valor inválido" })
    }),
    params: z.object({
        id: z.coerce.number().int().positive()
    }),
    query: z.object({}),
});

module.exports = changeEnrollmentStatusSchema;
