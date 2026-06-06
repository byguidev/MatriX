const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email: email }, select: { id: true, email: true, passwordHash: true} });
    const match = user && await bcrypt.compare(password, user.passwordHash);
    if (!user || !match) throw new AppError("E-mail ou senha não conferem", 400);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return token;
}

module.exports = {
    login
};
