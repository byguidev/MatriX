const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');
const bcrypt = require('bcrypt');

async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email: email }, select: { email: true, passwordHash: true} });
    const match = user && await bcrypt.compare(password, user.passwordHash);
    if (!user || !match) throw new AppError("E-mail ou senha não conferem", 400);
    return "Login efetuado com sucesso";
}

module.exports = {
    login
};
