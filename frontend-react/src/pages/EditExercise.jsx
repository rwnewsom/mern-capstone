import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditExercisePage = ({ exercise }) => {

    const [name, setName] = useState(exercise.name);
    const [reps, setReps] = useState(exercise.reps);
    const [weight, setWeight] = useState(exercise.weight);
    const [unit, setUnit] = useState(exercise.unit);
    const [date, setDate] = useState(exercise.date?.split('T')[0]);

    useEffect(() => {
        setName(exercise.name);
        setReps(exercise.reps);
        setWeight(exercise.weight);
        setUnit(exercise.unit);
        setDate(exercise.date?.split('T')[0]);
    }, [exercise]);

    const navigate = useNavigate();
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const updatedExercise = {
            name,
            reps,
            weight,
            unit,
            date,
        };

        try {
            const response = await fetch(`/exercises/${exercise._id}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(updatedExercise),
            });

            if (response.status===200){
                alert('Update Successful!');
                navigate('/');
            } else {
                alert(`Update Failed, Response: ${response.status}`);
            }

        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <h1>Update Exercise</h1>
            <form id="exerciseInfo" onSubmit={handleSubmit}>
            <fieldset>
            <legend>Your Details</legend>

            <p>
                <label htmlFor="name">Name</label>
                <input id="name"
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)} 
                />
            </p>

            <p>
                <label htmlFor="reps">Reps</label>
                <input id="reps"
                type="number"
                min="1"
                value={reps}
                onChange={e => setReps(e.target.valueAsNumber)} 
                />
            </p>

            <p>
                <label htmlFor="weight">Weight</label>
                <input id="weight"
                type="number"
                min="0"
                value={weight}
                onChange={e => setWeight(e.target.valueAsNumber)} 
                />
            </p>

            <p>
                <label htmlFor="unit">Unit</label>
                <select id="unit" name="unit" value={unit} onChange={e => setUnit(e.target.value)}>
                    <option value="kgs">kgs</option>
                    <option value="lbs">lbs</option>
                    <option value="miles">miles</option>
                </select>
            </p>

            <p>
                <label htmlFor="date">Date</label>
                <input id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)} 
                />
            </p>
             <p>
                <label htmlFor="save">Click to  </label>
                <button id="save" type="submit">SAVE</button>
            </p>
            </fieldset>
            </form>
        </div>
    );
}

export default EditExercisePage;