const signUpService = require('../services/signUp.service');

async function createUser(req, res) {
    await signUpService.createUser(req.body);
    res.sendStatus(201);
}

module.exports = {
    createUser,
};