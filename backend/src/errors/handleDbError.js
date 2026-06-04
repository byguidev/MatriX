const { Prisma } = require('@prisma/client');
const AppError = require('../errors/AppError');

const prismaErrors = {
  P2000: { message: 'O valor informado é longo demais', statusCode: 400 },
  P2001: { message: 'Registro não encontrado', statusCode: 404 },
  P2002: { message: 'Já existe um cadastro com este valor', statusCode: 409 },
  P2003: { message: 'Referência de chave estrangeira inválida', statusCode: 400 },
  P2011: { message: 'Campo obrigatório não informado', statusCode: 400 },
  P2012: { message: 'Campo obrigatório sem valor', statusCode: 400 },
  P2014: { message: 'Operação de relação inválida', statusCode: 400 },
  P2021: { message: 'Tabela do banco de dados não existe', statusCode: 500 },
  P2022: { message: 'Coluna do banco de dados não existe', statusCode: 500 },
  P2024: { message: 'Tempo de conexão com o banco esgotado', statusCode: 503 },
  P2025: { message: 'Registro solicitado não foi encontrado', statusCode: 404 },
  P2034: { message: 'Conflito de transação detectado', statusCode: 409 },
};

function handleDbError(err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = prismaErrors[err.code];

        if (prismaError) {
            throw new AppError(prismaError.message, prismaError.statusCode);
        }

        throw new AppError("Falha na operação do banco de dados", 500);
    }

    throw new AppError("Erro interno do servidor", 500);
}

module.exports = handleDbError;