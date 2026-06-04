const loginService = require('../services/login.service');

async function login(req, res) {
    const {email, password} = req.body;
    const login = await loginService.login(email, password);
    res.status(200).json(login);
}

module.exports = {
    login
};
