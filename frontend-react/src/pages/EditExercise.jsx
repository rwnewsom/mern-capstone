import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditExercisePage = ({ exercise }) => {

    const [name, setName] = useState(exercise?.name ?? '');
    const [reps, setReps] = useState(exercise?.reps ?? '');
    const [weight, setWeight] = useState(exercise?.weight ?? '');
    const [unit, setUnit] = useState(exercise?.unit ?? 'kgs');
    const [date, setDate] = useState(exercise?.date?.split('T')[0] ?? '');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setName(exercise?.name ?? '');
        setReps(exercise?.reps ?? '');
        setWeight(exercise?.weight ?? '');
        setUnit(exercise?.unit ?? 'kgs');
        setDate(exercise?.date?.split('T')[0] ?? '');
        setErrorMessage('');
    }, [exercise]);

    const navigate = useNavigate();
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!name.trim()) {
            setErrorMessage('Please enter an exercise name.');
            return;
        }

        if (!Number.isFinite(reps) || reps <= 0) {
            setErrorMessage('Please enter a positive number of reps.');
            return;
        }

        if (!Number.isFinite(weight) || weight < 0) {
            setErrorMessage('Please enter a non-negative weight.');
            return;
        }

        if (!unit) {
            setErrorMessage('Please select a unit.');
            return;
        }

        if (!date) {
            setErrorMessage('Please choose a date.');
            return;
        }

        const updatedExercise = {
            name,
            reps,
            weight,
            unit,
            date,
        };

        setIsSubmitting(true);

        try {
            const response = await fetch(`/exercises/${exercise._id}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(updatedExercise),
            });
            const data = await response.json().catch(() => null);

            if (response.ok) {
                alert('Update Successful!');
                navigate('/');
            } else {
                setErrorMessage(data?.Error || `Update Failed, Response: ${response.status}`);
            }

        } catch (e) {
            console.error(e);
            setErrorMessage('Unable to update exercise right now.');
        } finally {
            setIsSubmitting(false);
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
                <button id="save" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'SAVE'}
                </button>
            </p>
            {errorMessage && <p role="alert">{errorMessage}</p>}
            </fieldset>
            </form>
        </div>
    );
}

export default EditExercisePage;