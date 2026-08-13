export const VALID_UNITS = ['kgs', 'lbs', 'miles'];

export const EXERCISE_CONSTRAINTS = {
  name: {
    minLength: 1,
    maxLength: 255,
  },
  reps: {
    min: 1,
  },
  weight: {
    min: 0,
  },
};

export const ERROR_RESPONSES = {
  INVALID_REQUEST: { Error: 'Invalid request' },
  NOT_FOUND: { Error: 'Not found' },
};
