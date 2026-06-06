const coursesService = require('../services/courses.service');

// retorna a lista de cursos para montagem da tabela principal
async function listCourses(req, res) {
    const courses = await coursesService.listCourses(req.user.id);
    res.status(200).json(courses);
}

// cria curso com os dados recebidos do modal de cadastro
async function createCourse(req, res) {
    await coursesService.createCourse(req.body, req.user.id);
    res.sendStatus(201);
}

// remove curso pelo id informado na rota
async function deleteCourse(req, res) {
    await coursesService.deleteCourse(req.params.id);
    res.sendStatus(204);
}

// busca um curso especifico para preencher a tela de detalhe/edicao
async function getCourse(req, res) {
    const course = await coursesService.getCourse(req.params.id);
    res.status(200).json(course);
}

// evita retorno de sucesso quando nenhum campo foi alterado
async function updateCourse(req, res) {
    await coursesService.updateCourse(req.body, req.params.id);
    res.sendStatus(200).json(result);
}

module.exports = {
    listCourses,
    createCourse,
    deleteCourse,
    getCourse,
    updateCourse
};
