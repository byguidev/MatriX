const prisma = require('../config/db');
const formatter = require('../utils/formatters');
const { deleteStudent } = require('./students.service');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');

// lista cursos com preco formatado para exibicao direta no frontend
async function listCourses() {
    const courses = await prisma.course.findMany({ orderBy: { name: 'asc' } });
    courses.forEach(course => {
        course.price = formatter.formatCurrency(course.price);
    });
    return courses;
}

// retorna curso individual ja com valor monetario formatado
async function getCourse(id) {
    const course = await prisma.course.findUnique({
        where: { id: Number(id) },
        include: {
            classGroups: {
                orderBy: { name: 'asc' },
            },
        },
    });

    if (!course) throw new AppError('Course not found', 404);

    course.price = formatter.formatCurrency(course.price);
    return course;
}

// salva curso padronizando campos textuais em caixa alta
async function createCourse(body) {
    try {
        await prisma.course.create({
            data: {
                name: body.name.toUpperCase(),
                code: body.code.toUpperCase(),
                price: body.price,
                billingCycle: body.billingCycle.toUpperCase()
            }
        });
    } catch(err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

// atualiza somente campos enviados e avisa quando nada foi alterado
async function updateCourse(body, id) {
    try {
        const data = {};

        if (body.name !== undefined) {
            data.name = body.name.toUpperCase();
        }
        if (body.code !== undefined) {
            data.code = body.code.toUpperCase();
        }
        if (body.price !== undefined) {
            data.price = body.price;
        }
        if (body.billingCycle !== undefined) {
            data.billingCycle = body.billingCycle.toUpperCase();
        }

        if (Object.keys(data).length === 0) throw new AppError("No modified fields", 400);
        
        return await prisma.$transaction(async (tx) => {
            await tx.course.update({
                where: { id: Number(id) },
                data
            });

            if (data.code) {
                const classGroups = await tx.classGroup.findMany({ where: { courseId: Number(id) } });
                if (!classGroups.length) return;

                const newCode = data.code;

                for (c of classGroups) {
                    newName = c.name.replace(/[^.]+$/, newCode);
                    await tx.classGroup.update({
                        where: { id: c.id },
                        data: { name: newName },
                    })
                }
            }
        })

  } catch(err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
  }
}

// remove curso pelo identificador recebido, bem como as matriculas e turmas associadas
async function deleteCourse(id) {
    try {
        await prisma.$transaction(async (tx) => {
            const classGroups = await tx.classGroup.findMany({
                where: { courseId: Number(id) },
                select: {
                    id: true,
                    enrollments: {
                        where: { courseId: Number(id) },
                        select: {
                            studentId: true,
                        },
                    },
                },
            })

            for (const c of classGroups) {
                for (const e of c.enrollments) {
                    const student = await tx.student.findUnique({ 
                        where: { id: e.studentId },
                        select: { enrollmentCount: true, enrollmentStatus: true }, 
                    })

                    if (!student) throw new AppError("Student not found", 404);

                    const newEnrollmentCount = Number(student.enrollmentCount) - 1;

                    await tx.student.update({
                        where: { id: e.studentId },
                        data: {
                            enrollmentCount: Number(newEnrollmentCount),
                            enrollmentStatus: newEnrollmentCount <= 0 ? "PENDENTE" : student.enrollmentStatus
                        },
                    })
                }
                await tx.enrollment.deleteMany({ where: { classGroupId: c.id } });
            }

            await tx.classGroup.deleteMany({ where: { courseId: Number(id) }})
            await tx.course.delete( { where: { id: Number(id) } } )
        })
    } catch(err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

module.exports = {
    listCourses,
    createCourse,
    deleteCourse,
    getCourse,
    updateCourse,
};
