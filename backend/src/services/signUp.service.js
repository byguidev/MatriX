const { Prisma } = require('@prisma/client');
const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');
const bcrypt = require("bcrypt");

async function createUser(body) {
    try {
        await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                passwordHash: await bcrypt.hash(body.password, 10)
            }
        })
    } catch(err) {
        if (err instanceof AppError) throw err;
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new AppError("E-mail já cadastrado", 409);
        }
        handleDbError(err);
    }
}

module.exports = {
    createUser
};