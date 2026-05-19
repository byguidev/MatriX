const prisma = require('../config/db');
const formatter = require('../utils/formatters');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');

// busca alunos ordenados e entrega campos prontos para exibicao na tabela
async function listStudents() {
  const rows = await prisma.student.findMany({ orderBy: { fullName: 'asc' } });
  
  rows.forEach(row => {
    row.phone = formatter.formatPhone(row.phone);
    row.cpf = formatter.formatCpf(row.cpf);
    row.birthDate = formatter.formatDate(row.birthDate);
    row.enrollmentDate = formatter.formatDate(row.enrollmentDate);
  });
  return rows;
}

// retorna perfil individual com mascaras aplicadas para a interface
async function getStudentProfile(id) {
  const student = await prisma.student.findUnique({ where: { id: Number(id) } });

  const enrollments = await prisma.enrollment.findMany({ where: { studentId: Number(id) } })


  if (!student) throw new AppError("Student not found", 404);
  if (enrollments.length) student.enrollments = enrollments;

  for (let i = 0; i < enrollments.length; i++) {
    const course = await prisma.course.findUnique({ 
      where: { id: enrollments[i].courseId },
      select: { name: true }
    });
    const classGroup = await prisma.classGroup.findUnique({ 
      where: { id: enrollments[i].classGroupId },
      select: { name: true }
    });
    student.enrollments[i].courseName = course.name;
    student.enrollments[i].classGroupName = classGroup.name;
  }

  student.phone = formatter.formatPhone(student.phone);
  student.cpf = formatter.formatCpf(student.cpf);
  student.birthDate = formatter.formatDate(student.birthDate);
  student.enrollmentDate = formatter.formatDate(student.enrollmentDate);

  return student;
}

// cria matricula do aluno e sincroniza contadores de aluno e turma
async function createEnrollment(studentId, courseId, classGroupId, tx) {
  const classGroup = await tx.classGroup.findUnique({
    where: { id: Number(classGroupId) },
    select: { name: true, studentCount: true, maxSeats: true }
  });

  if (!classGroup) throw new AppError("Class group not found", 404);

  if (classGroup.studentCount >= classGroup.maxSeats) throw new AppError ("Maximum seats limit exceeded", 409);

  // gera nome sequencial da matricula para manter identificacao unica por turma
  const enrollmentName = `${classGroup.name}.${String(classGroup.studentCount + 1).padStart(4, '0')}`;

  await tx.enrollment.create({
  data: {
    studentId: Number(studentId),
    courseId: Number(courseId),
    classGroupId: Number(classGroupId),
    name: enrollmentName,
    status: "ATIVA"
  }
  });

  await tx.student.update({ 
    where: { id: Number(studentId) }, 
    data: { 
      enrollmentCount: {increment: 1}
    } 
  });

  await tx.classGroup.update({
    where: { id: Number(classGroupId) },
    data: {
      studentCount: {increment: 1},
      availableSeats: {decrement: 1}
    }
  });
}

// cria aluno e, quando informado, ja vincula ao curso/turma selecionados
async function createStudent(body) {
  try {
    const student = await prisma.$transaction(async (tx) => {
      const s = await tx.student.create({
        data: {
          fullName: body.fullName.toUpperCase(),
          cpf: body.cpf,
          birthDate: body.birthDate,
          email: body.email,
          phone: body.phone
        }
      });

      if (body.courseId && body.classGroupId) {
        await createEnrollment(s.id, body.courseId, body.classGroupId, tx);
      }

      return s;
    });

    return student;
  } catch (err) {
    if (err instanceof AppError) throw err;
    handleDbError(err);
  }
}

// monta update parcial apenas com os campos realmente enviados
async function updateStudent(body, id) {
  const data = {};

  if (body.fullName !== undefined) {
    data.fullName = body.fullName;
  }

  if (body.cpf !== undefined) {
    data.cpf = body.cpf;
  }

  if (body.birthDate !== undefined) {
    data.birthDate = body.birthDate;
  }

  if (body.email !== undefined) {
    data.email = body.email;
  }

  if (body.phone !== undefined) {
    data.phone = body.phone;
  }

  if (Object.keys(data).length === 0) throw new AppError("No modified fields", 400);

  try {
    return await prisma.student.update({
      where: { id: Number(id) },
      data
    });
  } catch(err) {
    if (err instanceof AppError) throw err;
    handleDbError(err);
  }
}

// remove matriculas antes de excluir aluno para manter contagem de vagas correta
async function deleteStudent(id) {
  return prisma.$transaction (async (tx) => {
    try {
      const enrollments = await tx.enrollment.findMany({
        where: { studentId: Number(id) }
      });

      for (const enrollment of enrollments) {
        const classGroup = await tx.classGroup.findUnique({
          where: { id: Number(enrollment.classGroupId) }
        });

        if (!classGroup) throw new AppError("Class group not found", 404);

        await tx.classGroup.update({
          where: { id: classGroup.id },
          data: {
            studentCount: { decrement: 1 },
            availableSeats: { increment: 1 }
          }
        });
      }
      await tx.enrollment.deleteMany({
        where: { studentId: Number(id) }
      });
      await tx.student.delete({
        where: { id: Number(id) }
      });
    } catch(err) {
      if (err instanceof AppError) throw err;
      handleDbError(err);
    }
  })
}

module.exports = {
  listStudents,
  createStudent,
  getStudentProfile,
  deleteStudent,
  updateStudent
};