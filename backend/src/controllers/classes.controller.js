const classesService = require('../services/classes.service');

// lista todas as turmas com os dados usados pela tabela de gerenciamento
async function listClasses(req, res) {
    const classes = await classesService.listClasses(req.user.id);
    res.status(200).json(classes);
}

// retorna os detalhes de uma turma especifica
async function getClassProfile(req, res) {
    const _class_ = await classesService.getClassProfile(req.params.id, req.user.id);
    res.status(200).json(_class_);
}

// cria turma com base nos dados enviados no formulario
async function createClass(req, res) {
    await classesService.createClass(req.body, req.user.id);
    res.sendStatus(201);
}

// remove turma e efeitos relacionados a matriculas
async function deleteClass(req, res) {
    await classesService.deleteClass(req.params.id, req.user.id);
    res.sendStatus(204);
}

// atualiza dados editaveis da turma
async function updateClass(req, res, next) {
    await classesService.updateClass(req.body, req.params.id, req.user.id);
    res.sendStatus(204);
}

module.exports = {
    listClasses,
    createClass,
    deleteClass,
    getClassProfile,
    updateClass,
};
