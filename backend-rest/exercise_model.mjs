// Get the mongoose object
import mongoose from 'mongoose';
import 'dotenv/config';

let connection = undefined;

/**
 * This function connects to the MongoDB server.
 */
async function connect(){
    if (connection) {
        return connection;
    }

    try{
        await mongoose.connect(process.env.MONGODB_CONNECT_STRING);
        connection = mongoose.connection;
        console.log("Successfully connected to MongoDB using Mongoose!");
        return connection;
    } catch(err){
        console.error(err);
        throw new Error(`Could not connect to MongoDB: ${err.message}`);
    }
}

// 1. create exercise schema

const exerciseSchema = mongoose.Schema({
    name: { type: String, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, required: true },
    date: { type: Date, required: true }
},
{collection : 'exercises'});

// 1.5 tried to use express validator here - bikeshedding

// 2. create exercise model

const Exercise = mongoose.model('Exercise', exerciseSchema);

// 3. CRUD operations
const createExercise = async (name, reps, weight, unit, date) => {
    const exercise = new Exercise({
        name,
        reps,
        weight,
        unit,
        date
    });
    console.log('Executing create query...');
    return await exercise.save();
}

const retrieveExercises = async () => {
    return await Exercise.find({}).exec();
}

const retrieveExerciseById = async (exerciseId) => {
    return await Exercise.findById(exerciseId).exec();
}

const updateExerciseById = async (exerciseId, updates) => {
    return await Exercise.updateOne({ _id: exerciseId }, updates).exec();
}

const deleteExerciseById = async (exerciseId) => {
    return await Exercise.deleteOne({ _id: exerciseId }).exec();
}

export { 
    connect, createExercise, retrieveExercises, retrieveExerciseById, 
    updateExerciseById, deleteExerciseById
};
