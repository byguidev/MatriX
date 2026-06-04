const { ZodError } = require('zod');
const AppError = require('../errors/AppError');

function errorHandler(err, req, res, next) {
    if (err instanceof ZodError) {
        console.log(err);
        return res.status(400).json({
            "message": "Dados inválidos",
            "issues": err.flatten().fieldErrors,
        });
    }

    if (err instanceof AppError) {
        console.log(err);
        return res.status(err.statusCode).json({
            "message": err.message
        });
    }

    console.log(err);

    return res.status(500).json({
        "message": "Erro interno do servidor"
    });
}

module.exports = errorHandler;