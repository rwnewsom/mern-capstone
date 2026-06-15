// Get the mongoose object
import mongoose from 'mongoose';
import 'dotenv/config';

let connection = undefined;

/**
 * This function connects to the MongoDB server.
 */
async function connect(){
    try{
        await mongoose.connect(process.env.MONGODB_CONNECT_STRING);
        connection = mongoose.connection;
        console.log("Successfully connected to MongoDB using Mongoose!");
    } catch(err){
        console.log(err);
        throw Error(`Could not connect to MongoDB ${err.message}`)
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
        name: name,
        reps: reps,
        weight: weight,
        unit: unit,
        date: date
    });
    console.log('Executing  create query...')
    return await exercise.save();
}

const retrieveExercises = async () => {
    const query = Exercise.find({});
    // console.log('Executing  retrieve query...')
    return await query.exec();
}

const retrieveExerciseById = async (exerciseId) => {
    const query = Exercise.find({"_id": exerciseId});
    return await query.exec();
}

const updateExerciseById = async (exerciseId, updates) => {
    const filter = {"_id": exerciseId};
    const query = Exercise.updateOne(filter, updates);
    return await query.exec();
}

// last op implement delete
const deleteExerciseById = async(exerciseId) => {
    const filter = {"_id": exerciseId};
    const query = Exercise.deleteOne(filter);
    const result = await query.exec();
    return result;
}

export { 
    connect, createExercise, retrieveExercises, retrieveExerciseById, 
    updateExerciseById, deleteExerciseById
};
