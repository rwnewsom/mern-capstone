import { body, validationResult } from 'express-validator';

export const validateExerciseFields = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .escape(),
  body('reps').isInt({ min: 1 }).withMessage('Reps must be a positive integer'),
  body('weight').isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
  body('unit')
    .trim()
    .isIn(['kgs', 'lbs', 'miles'])
    .withMessage('Unit must be one of: kgs, lbs, miles'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
];

export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      Error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
