const { z } = require('zod');

const createEnrollmentSchema = z.object({
    courseId: 
        z.coerce.number()
        .int()
        .positive()
        .refine((val) => courses.map(c => c.id).includes(val))
        .nullish(),
    classGroupId: 
        z.coerce.number()
        .int()
        .positive()
        .refine((val) => classes.map(c => c.id).includes(val))
        .nullish(),
});

module.exports = createEnrollmentSchema;