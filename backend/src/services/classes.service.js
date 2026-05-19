const prisma = require('../config/db');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');

// lista turmas com nome do curso para simplificar o consumo no frontend
async function listClasses() {
    try {
        const classes = await prisma.classGroup.findMany({
            orderBy: { name: 'asc' },
            include: {
                course: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return classes.map(({ course, ...classGroup }) => ({
            ...classGroup,
            courseName: course?.name ?? null,
        }));
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

// busca uma turma e adapta o retorno com nome do curso associado
async function getClassProfile(id) {
    try {
        const _class_ = await prisma.classGroup.findUnique({
            where: { id: Number(id) },
            include: {
                course: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!_class_) throw new AppError('Class group not found', 404);

        const formattedClass = {
            ..._class_,
            courseName: _class_.course?.name ?? null,
        };

        return formattedClass;
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

// gera nome sequencial da turma por curso e ano corrente
async function createClassName(courseId) {
    const currentYear = new Date().getFullYear();

    let courseCode = await prisma.course.findUnique({
        where: { id: Number(courseId) },
        select: { code: true }
    });

    if (!courseCode) throw new AppError('Course not found', 404);

    courseCode = courseCode.code;

    let classNumber = await prisma.classGroup.findFirst({
        where: { courseId: Number(courseId) },
        orderBy: { number: 'desc' },
    });
    
    !classNumber ? classNumber = 1 : classNumber = classNumber.number + 1;

    const className = `${currentYear}.${String(classNumber).padStart(2, '0')}.${courseCode.toUpperCase()}`;

    return {name: className, number: classNumber, year: currentYear};
}

// cria turma com contadores iniciais de ocupacao e status informado
async function createClass(body) {
    try {
        const newClassData = await createClassName(body.courseId);

        await prisma.classGroup.create({
            data: {
                courseId: Number(body.courseId),
                name: newClassData.name,
                number: newClassData.number,
                year: newClassData.year,
                studentCount: 0,
                maxSeats: body.maxSeats,
                availableSeats: body.maxSeats,
                status: body.status.toUpperCase(),
            }
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

// aplica update parcial e recalcula vagas disponiveis conforme alunos matriculados
async function updateClass(body, id) {
    try {
        const previous = await prisma.classGroup.findUnique({
            where: { id: Number(id) },
            select: { courseId: true },
        });

        if (!previous) throw new AppError('Class group not found', 404);

        const data = {};

        if (body.courseId !== undefined && body.courseId != previous.courseId) {
            data.courseId = body.courseId;
        }
        if (body.maxSeats !== undefined) {
            const classGroup = await prisma.classGroup.findUnique({ where: { id: Number(id) } });
            if (!classGroup) throw new AppError('Class group not found', 404);

            if (body.maxSeats < classGroup.studentCount) {
                throw new AppError("A quantidade máxima de alunos não pode ser menor que a quantidade de alunos matriculados", 400);
            }
            data.maxSeats = body.maxSeats;
        }
        if (body.status !== undefined) {
            data.status = body.status;
        }

        if (Object.keys(data).length === 0) {
            throw new AppError("No modified fields", 400);
        }

        await prisma.$transaction(async (tx) => {
            const classGroup = await tx.classGroup.findUnique({where:{id: Number(id)}});
            if (!classGroup) throw new AppError('Class group not found', 404);
            const effectiveMaxSeats = data.maxSeats ?? classGroup.maxSeats;

            await tx.classGroup.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    availableSeats: effectiveMaxSeats - classGroup.studentCount,
                }
            })

            if (data.courseId) {
                // ao trocar o curso, regenera identificacao da turma para novo contexto
                const newClassData = await createClassName(body.courseId);
                await tx.classGroup.update({
                    where: {id: Number(id)},
                    data: {
                        name: newClassData.name,
                        number: newClassData.number,
                        year: newClassData.year,
                    }
                })
            }
        })
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

// remove turma dentro de transacao para manter consistencia de matriculas e alunos
async function deleteClass(id) {
    try {
        const classId = Number(id);

        await prisma.$transaction(async (tx) => {
            const enrollments = await tx.enrollment.findMany({
                where: { classGroupId: classId }
            });

            await tx.enrollment.deleteMany({
                where: { classGroupId: classId }
            });

            for (const en of enrollments) {
                const student = await tx.student.findUnique({
                    where: { id: Number(en.studentId) }
                });

                if (!student) throw new AppError('Student not found', 404);

                const newCount = student.enrollmentCount - 1;

                await tx.student.update({
                    where: { id: student.id },
                    data: {
                        enrollmentCount: newCount,
                    }
                });
            }

            await tx.classGroup.delete({
                where: { id: classId }
            });
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

module.exports = {
    listClasses,
    createClass,
    deleteClass,
    getClassProfile,
    updateClass,
};