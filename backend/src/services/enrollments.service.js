const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');

// cria matricula do aluno e sincroniza contadores de aluno e turma
async function createEnrollment(studentId, courseId, classGroupId, tx = null) {
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: Number(classGroupId) },
    select: { name: true, studentCount: true, maxSeats: true }
  });

  if (!classGroup) throw new AppError("Class group not found", 404);

  if (classGroup.studentCount >= classGroup.maxSeats) throw new AppError ("Maximum seats limit exceeded", 409);

  // gera nome sequencial da matricula para manter identificacao unica por turma
  const enrollmentName = `${classGroup.name}.${String(classGroup.studentCount + 1).padStart(4, '0')}`;

  const run = async (db) => {
      const hasEnrollment = await db.enrollment.findFirst({ where: { studentId: Number(studentId), courseId: Number(courseId) } });

      if (hasEnrollment) throw new AppError("Student is already enrolled in this course", 409);

      await db.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        classGroupId: Number(classGroupId),
        name: enrollmentName,
        status: "ATIVA"
      }
      });

      await db.student.update({ 
        where: { id: Number(studentId) }, 
        data: { 
          enrollmentCount: {increment: 1}
        } 
      });

      const classGroup = await db.classGroup.findUnique({ 
        where: { id: Number(classGroupId) },
        select: { availableSeats: true, status: true }
      });

      await db.classGroup.update({
        where: { id: Number(classGroupId) },
        data: {
          studentCount: {increment: 1},
          availableSeats: {decrement: 1},
          status: classGroup.availableSeats == 1 ? "COMPLETA" : classGroup.status
        }
      });
  }

  if (tx) return run(tx);
  return run(prisma);
}

async function changeEnrollmentStatus(enrollmentId, status) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: Number(enrollmentId) },
      select: { status: true, classGroupId: true }
    });

    if (!enrollment) throw new AppError("Enrollment not found", 404);

    if (enrollment.status === "CANCELADA" && status !== "CANCELADA") {
      throw new AppError("Canceled enrollment cannot change status", 409);
    }

    if (enrollment.status === status) return;

    return prisma.$transaction(async (tx) => {
      if (status !== "ATIVA") {
        await tx.classGroup.update({
          where: {id: Number(enrollment.classGroupId)},
          data: {
            studentCount: { decrement: 1 },
            availableSeats: { increment: 1 },
          }
        })
      } else {
        await tx.classGroup.update({
          where: {id: Number(enrollment.classGroupId)},
          data: {
            studentCount: { increment: 1 },
            availableSeats: { decrement: 1 },
          }
        })
      }

      const classGroup = await tx.classGroup.findUnique({
        where: { id: Number(enrollment.classGroupId) },
        select: { availableSeats: true },
      });

      await tx.classGroup.update({
        where: { id: Number(enrollment.classGroupId) },
        data: { status: classGroup.availableSeats <= 0 ? "COMPLETA" : "ABERTA" },
      })
      
      await tx.enrollment.update({
        where: { id: Number(enrollmentId) },
        data: { status }
      });
    })
  } catch (err) {
    if (err instanceof AppError) throw err;
    handleDbError(err);
  }
}

module.exports = {
    createEnrollment,
    changeEnrollmentStatus,
}
