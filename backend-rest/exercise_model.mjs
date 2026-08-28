import mongoose from 'mongoose';
import 'dotenv/config';
import { logger } from './logger.mjs';
import { config } from './config.mjs';
import { traceDbOperation } from './db_instrumentation.mjs';

let connection = undefined;

/**
 * This function connects to the MongoDB server.
 */
async function connect() {
  if (connection) {
    return connection;
  }

  try {
    await mongoose.connect(config.mongodb.url);
    connection = mongoose.connection;
    logger.info('Database connection established');
    return connection;
  } catch (err) {
    logger.error('Database connection failed', { error: err.message });
    throw new Error(`Could not connect to MongoDB: ${err.message}`, { cause: err });
  }
}

// 1. create exercise schema

const exerciseSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, required: true },
    date: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { collection: 'exercises' }
);

// 1.5 tried to use express validator here - bikeshedding

// 2. create exercise model

const Exercise = mongoose.model('Exercise', exerciseSchema);

// 3. CRUD operations
const createExercise = async (name, reps, weight, unit, date, userId) => {
  return traceDbOperation('save', 'exercises', 'insert', async () => {
    const exercise = new Exercise({
      name,
      reps,
      weight,
      unit,
      date,
      userId,
    });
    return await exercise.save();
  });
};

const retrieveExercises = async (userId) => {
  return traceDbOperation('find', 'exercises', 'query', async () => {
    return await Exercise.find({ userId }).exec();
  });
};

const retrieveExerciseById = async (exerciseId, userId) => {
  return traceDbOperation('findOne', 'exercises', 'query', async () => {
    return await Exercise.findOne({ _id: exerciseId, userId }).exec();
  });
};

const updateExerciseById = async (exerciseId, userId, updates) => {
  return traceDbOperation('updateOne', 'exercises', 'update', async () => {
    return await Exercise.updateOne({ _id: exerciseId, userId }, updates).exec();
  });
};

const deleteExerciseById = async (exerciseId, userId) => {
  return traceDbOperation('deleteOne', 'exercises', 'delete', async () => {
    return await Exercise.deleteOne({ _id: exerciseId, userId }).exec();
  });
};

export {
  connect,
  createExercise,
  retrieveExercises,
  retrieveExerciseById,
  updateExerciseById,
  deleteExerciseById,
  // Exported so tests can stub the Mongoose layer (Exercise.find/save/etc.)
  // directly rather than mocking createExercise/retrieveExercises/etc.
  // themselves, which is not possible: those are `import * as` namespace
  // bindings, and ESM namespace objects are non-configurable.
  Exercise,
};
