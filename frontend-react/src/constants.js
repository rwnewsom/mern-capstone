export const VALID_UNITS = ['kgs', 'lbs', 'miles'];

export const EXERCISE_CONSTRAINTS = {
  name: {
    minLength: 1,
    maxLength: 255
  },
  reps: {
    min: 1
  },
  weight: {
    min: 0
  }
};

export const API_ENDPOINTS = {
  EXERCISES: '/exercises',
  HEALTH: '/health',
  CONFIG_UNITS: '/config/units'
};
