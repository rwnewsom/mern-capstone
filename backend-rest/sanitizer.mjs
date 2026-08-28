import { body, validationResult } from 'express-validator';

export const validateExerciseFields = [
  // .escape() is deliberately not used here: it HTML-entity-encodes the value
  // (e.g. "Bench & Press" -> "Bench &amp; Press") and that would be persisted
  // to MongoDB as-is, corrupting the stored name for every API consumer.
  // Output encoding belongs at render time, not storage time.
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
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
      // express-validator v7 names this `path`, not `param` (the pre-v7 name) —
      // using the wrong key silently produced `{ field: undefined, ... }` for
      // every validation error response.
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
