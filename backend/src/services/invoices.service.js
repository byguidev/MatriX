const { Prisma } = require('@prisma/client');
const prisma = require('../config/db');
const formatter = require('../utils/formatters');
const AppError = require('../errors/AppError');
const handleDbError = require('../errors/handleDbError');
const { addDays, getBillingCycleDays } = require('../utils/invoice-helpers');
const { changeEnrollmentStatus } = require('./enrollments.service');

const OVERDUE_PENALTY_RATE = 0.1;
const INVOICE_DUE_DAYS = 30;
const PAYMENT_GRACE_DAYS = 15;

function applyOverduePenalty(value) {
    const decimalValue = new Prisma.Decimal(value);
    return decimalValue.mul(new Prisma.Decimal(1 + OVERDUE_PENALTY_RATE)).toDecimalPlaces(2);
}

function serializeInvoice(invoice) {
    return {
        id: invoice.id,
        studentId: invoice.studentId,
        studentName: invoice.student?.fullName ?? null,
        enrollmentId: invoice.enrollmentId,
        enrollmentName: invoice.enrollment?.name ?? null,
        classGroupId: invoice.enrollment?.classGroupId ?? null,
        classGroupName: invoice.enrollment?.classGroup?.name ?? null,
        courseId: invoice.enrollment?.courseId ?? null,
        courseName: invoice.enrollment?.course?.name ?? null,
        value: formatter.formatCurrency(Number(invoice.value)),
        issueDate: formatter.formatDate(invoice.issueDate),
        dueDate: formatter.formatDate(invoice.dueDate),
        currency: invoice.currency,
        status: invoice.status,
    };
}

async function syncOverdueInvoices(db, now) {
    const invoices = await db.fatura.findMany({
        where: {
            status: { in: ["ABERTA", "VENCIDA"] },
        },
        include: {
            enrollment: {
                select: { id: true, status: true },
            },
        },
    });

    for (const invoice of invoices) {
        const isPastDueDate = invoice.dueDate < now;
        const isPastCancelDate = addDays(invoice.dueDate, PAYMENT_GRACE_DAYS) < now;

        if (invoice.status === "ABERTA" && isPastDueDate) {
            await db.fatura.update({
                where: { id: invoice.id },
                data: {
                    status: "VENCIDA",
                    value: applyOverduePenalty(invoice.value),
                },
            });
        }

        if (isPastCancelDate && invoice.enrollment && invoice.enrollment.status !== "CANCELADA") {
            await changeEnrollmentStatus(invoice.enrollment.id, "CANCELADA", { allowCanceled: true, tx: db });
            continue;
        }

        if (invoice.status === "ABERTA" && isPastDueDate && invoice.enrollment && invoice.enrollment.status === "ATIVA") {
            await changeEnrollmentStatus(invoice.enrollment.id, "TRANCADA", { allowCanceled: true, tx: db });
        }

        if (invoice.status === "VENCIDA" && invoice.enrollment && invoice.enrollment.status === "ATIVA") {
            await changeEnrollmentStatus(invoice.enrollment.id, "TRANCADA", { allowCanceled: true, tx: db });
        }
    }
}

async function ensureRecurringInvoices(db, now) {
    const enrollments = await db.enrollment.findMany({
        where: { status: "ATIVA" },
        include: {
            course: { select: { price: true, billingCycle: true } },
            faturas: { orderBy: { issueDate: "desc" }, take: 1 },
        },
    });

    for (const enrollment of enrollments) {
        const billingDays = getBillingCycleDays(enrollment.course?.billingCycle);

        if (!billingDays) {
            throw new AppError("Invalid billing cycle for recurring invoice", 400);
        }

        const lastInvoice = enrollment.faturas[0];

        if (!lastInvoice) {
            const issueDate = now;
            await db.fatura.create({
                data: {
                    studentId: enrollment.studentId,
                    enrollmentId: enrollment.id,
                    value: enrollment.course.price,
                    issueDate,
                    dueDate: addDays(issueDate, INVOICE_DUE_DAYS),
                    currency: enrollment.course.billingCycle,
                    status: "ABERTA",
                },
            });
            continue;
        }

        let nextIssueDate = addDays(lastInvoice.issueDate, billingDays);

        while (nextIssueDate <= now) {
            await db.fatura.create({
                data: {
                    studentId: enrollment.studentId,
                    enrollmentId: enrollment.id,
                    value: enrollment.course.price,
                    issueDate: nextIssueDate,
                    dueDate: addDays(nextIssueDate, INVOICE_DUE_DAYS),
                    currency: enrollment.course.billingCycle,
                    status: "ABERTA",
                },
            });
            nextIssueDate = addDays(nextIssueDate, billingDays);
        }
    }
}

async function syncInvoices(db = prisma, now = new Date()) {
    await ensureRecurringInvoices(db, now);
    await syncOverdueInvoices(db, now);
}

async function listInvoices() {
    try {
        return await prisma.$transaction(async (tx) => {
            const now = new Date();

            await syncInvoices(tx, now);

            const invoices = await tx.fatura.findMany({
                orderBy: { issueDate: "desc" },
                include: {
                    student: { select: { fullName: true } },
                    enrollment: {
                        select: {
                            name: true,
                            classGroupId: true,
                            courseId: true,
                            status: true,
                            classGroup: { select: { name: true } },
                            course: { select: { name: true } },
                        },
                    },
                },
            });

            return invoices.map(serializeInvoice);
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

async function changeInvoiceStatus(invoiceId, status) {
    try {
        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.fatura.findUnique({
                where: { id: Number(invoiceId) },
                include: {
                    student: { select: { fullName: true } },
                    enrollment: {
                        select: {
                            name: true,
                            classGroupId: true,
                            courseId: true,
                            status: true,
                            classGroup: { select: { name: true } },
                            course: { select: { name: true } },
                        },
                    },
                },
            });

            if (!invoice) throw new AppError("Invoice not found", 404);

            if (invoice.status === status) return serializeInvoice(invoice);

            const data = { status };

            if (status === "VENCIDA" && invoice.status !== "VENCIDA") {
                data.value = applyOverduePenalty(invoice.value);
            }

            await tx.fatura.update({
                where: { id: Number(invoiceId) },
                data,
            });

            if (status === "PAGA") {
                await changeEnrollmentStatus(invoice.enrollmentId, "ATIVA", { allowCanceled: true, tx });
            } else if (status === "VENCIDA" && invoice.enrollment?.status === "ATIVA") {
                await changeEnrollmentStatus(invoice.enrollmentId, "TRANCADA", { allowCanceled: true, tx });
            } else if (status === "ABERTA" && invoice.enrollment?.status !== "ATIVA") {
                await changeEnrollmentStatus(invoice.enrollmentId, "ATIVA", { allowCanceled: true, tx });
            }

            const updatedInvoice = await tx.fatura.findUnique({
                where: { id: Number(invoiceId) },
                include: {
                    student: { select: { fullName: true } },
                    enrollment: {
                        select: {
                            name: true,
                            classGroupId: true,
                            courseId: true,
                            status: true,
                            classGroup: { select: { name: true } },
                            course: { select: { name: true } },
                        },
                    },
                },
            });

            return serializeInvoice(updatedInvoice);
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        handleDbError(err);
    }
}

module.exports = {
    listInvoices,
    changeInvoiceStatus,
    syncInvoices,
};
