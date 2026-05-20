const studentsService = require('../services/students.service');

// cria novo aluno a partir dos dados enviados no formulario
async function createStudent(req, res) {
  await studentsService.createStudent(req.validatedData.body);
  res.sendStatus(201);
}

// bloqueia update vazio para evitar chamada sem efeito no banco
async function updateStudent(req, res) {
  await studentsService.updateStudent(req.validatedData.body, req.params.id);
  res.sendStatus(200);
}

// lista alunos e normaliza nome em caixa alta para manter padrao da tela
async function listStudents(req, res) {
  const students = await studentsService.listStudents();
  res.status(200).json(students);
}

// retorna os dados completos de um aluno para a tela de perfil
async function getStudentProfile(req, res) {
  const studentProfile = await studentsService.getStudentProfile(req.params.id);
  res.status(200).json(studentProfile);
}

// remove aluno e dependencias de matricula
async function deleteStudent(req, res) {
  await studentsService.deleteStudent(req.params.id);
  res.sendStatus(204);
}

module.exports = {
  listStudents,
  createStudent,
  getStudentProfile,
  deleteStudent,
  updateStudent
};
