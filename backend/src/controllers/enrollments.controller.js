const enrollmentsService = require('../services/enrollments.service');

async function listEnrollments(req, res) {
  const enrollments = await enrollmentsService.listEnrollments(req.params.id);
  res.status(200).json(enrollments);
}

async function createEnrollment(req, res) {
  await enrollmentsService.createEnrollment(req.body.studentId, req.body.courseId, req.body.classGroupId);
  res.sendStatus(201);
}

async function changeEnrollmentStatus(req, res) {
  await enrollmentsService.changeEnrollmentStatus(req.params.id, req.validatedData.body.status);
  res.sendStatus(200);
}

module.exports = {
    listEnrollments,
    createEnrollment,
    changeEnrollmentStatus,
}
