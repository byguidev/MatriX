const { z } = require('zod');

const userSchema = z.object({
    body: z.object({
        name: z.string()
            .min(3),
        email: z.string()
            .email(),
        password: z.string()
            .min(6)
            .max(16),
        confirmPassword: z.string()
    }).refine(
        (data) => data.password === data.confirmPassword, { 
            message: 'As senhas precisam ser iguais', 
            path: ['confirmPassword']
        }),
    params: z.object({}),
    query: z.object({})

});

module.exports = userSchema;