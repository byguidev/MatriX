const { PrismaClient } = require('@prisma/client');

// centraliza a conexao com o banco para ser reutilizada em toda a api
const prismaClient = new PrismaClient({
  errorFormat: 'minimal',
});

module.exports = prismaClient;
