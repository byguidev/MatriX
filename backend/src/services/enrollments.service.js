const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');
const { addDays } = require('../utils/invoice-helpers');

async function listEnrollments(id, userId) {
  const enrollments = await prisma.enrollment.findMany({ 
    where: { 
      studentId: Number(id),
      userId: Number(userId)
    }
  });
  if (!enrollments) throw new AppError("Enrollments not found", 404);
  return enrollments;
}

// cria matricula do aluno e sincroniza contadores de aluno e turma
async function createEnrollment(studentId, courseId, classGroupId, userId, tx = null) {
  const run = async (db) => {
    const classGroup = await db.classGroup.findUnique({
      where: { 
        id: Number(classGroupId),
        userId: Number(userId)
      },
      select: { 
        name: true, 
        studentCount: true, 
        maxSeats: true, 
        availableSeats: true, 
        status: true 
      }
    });

    if (!classGroup) throw new AppError("Class group not found", 404);

    if (classGroup.studentCount >= classGroup.maxSeats) throw new AppError("Maximum seats limit exceeded", 409);

    const hasEnrollment = await db.enrollment.findFirst({
      where: { 
        studentId: Number(studentId), 
        courseId: Number(courseId), 
        status: "ATIVA",
        userId: Number(userId)
      }
    });

    if (hasEnrollment) throw new AppError("Student is already enrolled in this course", 409);

    const course = await db.course.findUnique({
      where: { 
        id: Number(courseId),
        userId: Number(userId)
      },
      select: { 
        price: true, 
        billingCycle: true 
      }
    });

    if (!course) throw new AppError("Course not found", 404);

    const updatedClassGroup = await db.classGroup.update({
      where: { 
        id: Number(classGroupId),
        userId: Number(userId)
      },
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

    const createdEnrollment = await db.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        classGroupId: Number(classGroupId),
        name: enrollmentName,
        status: "ATIVA",
        userId: Number(userId)
      },
      select: { id: true }
    });

    await db.student.update({
      where: { 
        id: Number(studentId),
        userId: Number(userId)
      },
      data: {
        enrollmentCount: { increment: 1 }
      }
    });

    const issueDate = new Date();
    const dueDate = addDays(issueDate, 30);

    await db.fatura.create({
      data: {
        studentId: Number(studentId),
        enrollmentId: createdEnrollment.id,
        value: course.price,
        issueDate,
        dueDate,
        currency: course.billingCycle,
        status: "ABERTA",
        userId: Number(userId)
      }
    });
  }

  if (tx) return run(tx);
  return run(prisma);
}

async function changeEnrollmentStatus(enrollmentId, status, userId, options = {}) {
  try {
    const allowCanceled = options.allowCanceled === true;
    const tx = options.tx ?? null;
    const db = tx ?? prisma;

    const enrollment = await db.enrollment.findUnique({
      where: { 
        id: Number(enrollmentId),
        userId: Number(userId)
      },
      select: { 
        status: true, 
        classGroupId: true, 
        studentId: true 
      }
    });

    if (!enrollment) throw new AppError("Enrollment not found", 404);

    if (!allowCanceled && enrollment.status === "CANCELADA" && status !== "CANCELADA") {
      throw new AppError("Canceled enrollment cannot change status", 409);
    }

    if (enrollment.status === status) return;

    const run = async (db) => {
      const isLeavingActive = enrollment.status === "ATIVA" && status !== "ATIVA";
      const isReturningActive = enrollment.status !== "ATIVA" && status === "ATIVA";

      if (isLeavingActive) {
        await db.classGroup.update({
          where: { 
            id: Number(enrollment.classGroupId),
            userId: Number(userId)
          },
          data: {
            studentCount: { decrement: 1 },
            availableSeats: { increment: 1 },
          }
        });
      }

      if (isReturningActive) {
        const classGroup = await db.classGroup.findUnique({
          where: { 
            id: enrollment.classGroupId,
            userId: Number(userId)
          },
          select: { availableSeats: true }
        });

        if (classGroup.availableSeats === 0) throw new AppError("Maximum number of available seats reached", 400);

        await db.classGroup.update({
          where: { 
            id: Number(enrollment.classGroupId),
            userId: Number(userId)
          },
          data: {
            studentCount: { increment: 1 },
            availableSeats: { decrement: 1 },
          }
        });
      }

      const classGroup = await db.classGroup.findUnique({
        where: { 
          id: Number(enrollment.classGroupId),
          userId: Number(userId)
        },
        select: { availableSeats: true },
      });

      await db.classGroup.update({
        where: { 
          id: Number(enrollment.classGroupId),
          userId: Number(userId)
        },
        data: { status: classGroup.availableSeats <= 0 ? "COMPLETA" : "ABERTA" },
      });

      await db.enrollment.update({
        where: { 
          id: Number(enrollmentId),
          userId: Number(userId)
        },
        data: { status }
      });

      if (enrollment.status !== "CANCELADA" && status === "CANCELADA") {
        await db.student.update({
          where: { 
            id: enrollment.studentId,
            userId: Number(userId)
          },
          data: {
            enrollmentCount: { decrement: 1 },
          }
        });
      } else if (enrollment.status === "CANCELADA" && status !== "CANCELADA") {
        await db.student.update({
          where: { 
            id: enrollment.studentId,
            userId: Number(userId)
          },
          data: {
            enrollmentCount: { increment: 1 },
          }
        });
      }
    };

    if (tx) return run(tx);
    return prisma.$transaction(run);
  } catch (err) {
    if (err instanceof AppError) throw err;
    handleDbError(err);
  }
}

module.exports = {
    listEnrollments,
    createEnrollment,
    changeEnrollmentStatus,
}
