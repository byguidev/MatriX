const enrollmentsService = require('../services/enrollments.service');

async function createEnrollment(req, res) {
  await enrollmentsService.createEnrollment(req.body.studentId, req.body.courseId, req.body.classGroupId);
  res.sendStatus(201);
}

module.exports = {
    createEnrollment,
}