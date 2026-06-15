import 'dotenv/config';
import asyncHandler from 'express-async-handler';
import { pathToFileURL } from 'node:url';

import express from 'express';
import * as exercises from './exercise_model.mjs';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const INVALID_REQUEST = {"Error": "Invalid request"};
const NOT_FOUND = {"Error": "Not found"};
const VALID_UNITS = ['kgs', 'lbs', 'miles'];

const validateExerciseInput = (data) => {
    const { name, reps, weight, unit, date } = data ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
        return null;
    }

    if (!Number.isInteger(reps) || reps <= 0) {
        return null;
    }

    if (!Number.isInteger(weight) || weight < 0) {
        return null;
    }

    if (typeof unit !== 'string' || !VALID_UNITS.includes(unit)) {
        return null;
    }

    if (typeof date !== 'string' || !Date.parse(date)) {
        return null;
    }

    return { name, reps, weight, unit, date };
};

const startServer = () => {
    app.listen(PORT, async () => {
        await exercises.connect();
        console.log(`Server listening on port: ${PORT}...`);
    });
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    startServer();
}

export { validateExerciseInput };

app.post('/exercises', asyncHandler(async (req, res) => {
    const validatedInput = validateExerciseInput(req.body);

    if (!validatedInput) {
        return res.status(400).json(INVALID_REQUEST);
    }

    const { name, reps, weight, unit, date } = validatedInput;
    const result = await exercises.createExercise(name, reps, weight, unit, date);

    return res.status(201).json(result);
}));

app.get('/exercises', asyncHandler(async (req, res) => {
    const result = await exercises.retrieveExercises();
    return res.status(200).json(result);
}));

// debug note - missed trailing `/`
app.get('/exercises/:id', asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const result = await exercises.retrieveExerciseById(exerciseId);

    if (!result) {
        return res.status(404).json(NOT_FOUND);
    }

    return res.status(200).json(result);
}));

app.put('/exercises/:id', asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const validatedInput = validateExerciseInput(req.body);

    if (!validatedInput) {
        return res.status(400).json(INVALID_REQUEST);
    }

    const updates = validatedInput;
    const result = await exercises.updateExerciseById(exerciseId, updates);

    if (result.matchedCount === 0) {
        return res.status(404).json(NOT_FOUND);
    }

    const updatedExercise = await exercises.retrieveExerciseById(exerciseId);
    return res.status(200).json(updatedExercise);
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