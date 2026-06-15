import 'dotenv/config';
import asyncHandler from 'express-async-handler';

import express, { response } from 'express';
import * as exercises from './exercise_model.mjs';

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

const INVALID_REQUEST = {"Error": "Invalid request"};
const NOT_FOUND = {"Error": "Not found"};
const VALID_UNITS = ['kgs', 'lbs', 'miles'];

app.listen(PORT, async () => {
    await exercises.connect()
    console.log(`Server listening on port: ${PORT}...`);
});

app.post('/exercises', asyncHandler(async (req, res) => {
    // todo: refactor if time permits
    // update time did not permit. later will pull out a validator func
    // console.log('+*+* RETRIEVE CONTROLLER HIT *+*+*')
    const name = req.body.name;
    if (!name || typeof name !== 'string'){
        return res.status(400).json(INVALID_REQUEST);
    }

    const reps = req.body.reps;
    if (!reps || typeof reps !== 'number' || 
        !Number.isInteger(reps) || reps <=0 ) {
        return res.status(400).json(INVALID_REQUEST);
    }

    const weight = req.body.weight; //issue: !weight will fail if 0;
    if (typeof weight !== 'number' || 
        !Number.isInteger(weight) || weight < 0 ) {
        return res.status(400).json(INVALID_REQUEST);
        }

    const unit = req.body.unit;
    if (!unit || typeof unit !== 'string' || !VALID_UNITS.includes(unit) ) {
        return res.status(400).json(INVALID_REQUEST);
    } 
    
    const date = req.body.date;
    if (!date || !Date.parse(date)) {
        return res.status(400).json(INVALID_REQUEST);
    }
    else {
        const result = await exercises.createExercise(
        name,
        reps,
        weight,
        unit,
        date
    );

    // console.log('Sending get response...')
    return res.status(201).json(result);
    }
}));

app.get('/exercises', asyncHandler(async (req, res) => {
    const result = await exercises.retrieveExercises();
    return res.status(200).json(result);
}));

// debug note - missed trailing `/`
app.get('/exercises/:id', asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const result = await exercises.retrieveExerciseById(exerciseId);
    
    if (result.length == 0){
        return res.status(404).json(NOT_FOUND);
    } else {
        res.status(200).json(result.shift());
    }
}));

app.put('/exercises/:id', asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    
    const name = req.body.name;
    if (!name || typeof name !== 'string'){
        return res.status(400).json(INVALID_REQUEST);
    }

    const reps = req.body.reps;
    if (!reps || typeof reps !== 'number' || 
        !Number.isInteger(reps) || reps <= 0
    ) {
        return res.status(400).json(INVALID_REQUEST);
    }

    const weight = req.body.weight;
    if (
        typeof weight !== 'number' || 
        !Number.isInteger(weight) || weight < 0 ){
            return res.status(400).json(INVALID_REQUEST);
        }

    const unit = req.body.unit;
    if (!unit || typeof unit !== 'string' || !VALID_UNITS.includes(unit) ) {
        return res.status(400).json(INVALID_REQUEST);
    } 
    
    const date = req.body.date;
    if (!date || !Date.parse(date)) {
        return res.status(400).json(INVALID_REQUEST);
    }

    const updates = {
        name: name,
        reps: reps,
        weight: weight,
        unit: unit,
        date: date
    }

    const result = await exercises.updateExerciseById(exerciseId, updates);

    if (result.matchedCount === 0){
        res.status(404).json(NOT_FOUND)
    }

    else{
        const result = await exercises.retrieveExerciseById(exerciseId);
        res.status(200).json(result.shift());
    }
}));

app.delete('/exercises/:id', asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const result = await exercises.deleteExerciseById(exerciseId);
    
    if (result.deletedCount === 0){
        res.status(404).json(NOT_FOUND);
    }
    else {
        res.status(204).json();
    }
}));