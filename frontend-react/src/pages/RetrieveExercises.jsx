import { Link, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';

import ExerciseTable from '../components/ExerciseTable';
import DeleteIcon from '../components/DeleteIcon';
import Toast from '../components/Toast';
import { fetchWithTimeout, handleApiError } from '../utils/api';

function RetrieveExercises({ setExerciseToEdit }) {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState(null);

    const onEdit = async exerciseToEdit => {
        setExerciseToEdit(exerciseToEdit);
        navigate('/update');
    };
    
    const loadExercises = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetchWithTimeout('/exercises');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.Error || 'Unable to load exercises.');
            }

            setExercises(data);
        } catch (error) {
            const errorMsg = handleApiError(error);
            setErrorMessage(errorMsg);
            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
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