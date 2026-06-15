import { Link, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';

import ExerciseTable from '../components/ExerciseTable';
import DeleteIcon from '../components/DeleteIcon';

function RetrieveExercises({ setExerciseToEdit }) {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const onEdit = async exerciseToEdit => {
        setExerciseToEdit(exerciseToEdit);
        navigate('/update');
    };
    
    const loadExercises = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('/exercises');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.Error || 'Unable to load exercises.');
            }

            setExercises(data);
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || 'Unable to load exercises.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    return (
        <>
            <h2>List of Exercises</h2>
            {isLoading && <p>Loading exercises...</p>}
            {errorMessage && <p role="alert">{errorMessage}</p>}
            {!isLoading && !errorMessage && exercises.length === 0 && <p>No exercises found.</p>}
            <ExerciseTable exercises={exercises} 
                DeleteIcon={DeleteIcon} 
                setExercises={setExercises} 
                onEdit={onEdit}
            />
        </>
    );
}

export default RetrieveExercises;