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
        handleDbError(err);
    }
}

module.exports = {
    createUser
};