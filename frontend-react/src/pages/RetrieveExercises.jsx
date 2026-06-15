import { Link, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';

import ExerciseTable from '../components/ExerciseTable';
import DeleteIcon from '../components/DeleteIcon';

function RetrieveExercises({ setExerciseToEdit }) {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);

    const onEdit = async exerciseToEdit => {
        setExerciseToEdit(exerciseToEdit);
        navigate('/update');
    };
    
    const loadExercises = async () => {
        const response = await fetch('/exercises');
        const data = await response.json();
        setExercises(data);
    };

    useEffect(() => {
            loadExercises();
        }, [setExercises]);


    return (
        <>
            <h2>List of Exercises</h2>
            <
                ExerciseTable exercises={exercises} 
                DeleteIcon={DeleteIcon} 
                setExercises={setExercises} 
                onEdit={onEdit}
            />
        </>
    );
}

export default RetrieveExercises;