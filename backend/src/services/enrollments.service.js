const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');

// cria matricula do aluno e sincroniza contadores de aluno e turma
async function createEnrollment(studentId, courseId, classGroupId, tx = null) {
  const run = async (db) => {
    const classGroup = await db.classGroup.findUnique({
      where: { id: Number(classGroupId) },
      select: { name: true, studentCount: true, maxSeats: true, availableSeats: true, status: true }
    });

    if (!classGroup) throw new AppError("Class group not found", 404);

    if (classGroup.studentCount >= classGroup.maxSeats) throw new AppError("Maximum seats limit exceeded", 409);

    const hasEnrollment = await db.enrollment.findFirst({
      where: { studentId: Number(studentId), courseId: Number(courseId), status: "ATIVA" }
    });

    if (hasEnrollment) throw new AppError("Student is already enrolled in this course", 409);

    const updatedClassGroup = await db.classGroup.update({
      where: { id: Number(classGroupId) },
      data: {
        studentCount: { increment: 1 },
        availableSeats: { decrement: 1 },
        nextEnrollmentNumber: { increment: 1 },
        status: classGroup.availableSeats == 1 ? "COMPLETA" : classGroup.status
      },
      select: { nextEnrollmentNumber: true }
    });

    // gera nome sequencial da matricula com contador monotônico por turma
    const enrollmentName = `${classGroup.name}.${String(updatedClassGroup.nextEnrollmentNumber).padStart(3, '0')}`;

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
        enrollmentCount: { increment: 1 }
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
      select: { status: true, classGroupId: true, studentId: true }
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
        const classGroup = await tx.classGroup.findUnique({ 
          where: { id: enrollment.classGroupId },
          select: { availableSeats: true }
        });
        
        console.log(classGroup.availableSeats);
        if (classGroup.availableSeats === 0) throw new AppError("Maximum number of available seats reached", 400);

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

      const student = await tx.student.findUnique({ 
        where: { id: enrollment.studentId },
        select: { id: true, enrollmentCount: true }
      });

      await tx.student.update({
        where: { id: student.id },
        data: {
          enrollmentCount: status === "CANCELADA" ? {decrement: 1} : student.enrollmentCount,
        }
      })
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
