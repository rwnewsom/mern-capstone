import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { fetchWithTimeout, handleApiError } from '../utils/api';
import { VALID_UNITS } from '../constants';

export const CreateExercisePage = () => {
  const today = new Date();
  const todayFormatted = today.toISOString();

  const [name, setName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kgs');
  const [date, setDate] = useState(todayFormatted?.split('T')[0]); //fixme TZ aware?
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

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

    const newExercise = {
      name,
      reps,
      weight,
      unit,
      date,
    };

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetchWithTimeout('/exercises', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(newExercise),
      });
      const data = await response.json().catch(() => null);

      if (response.ok) {
        setToast({ message: 'Exercise created successfully!', type: 'success' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        const errorMsg = data?.Error || `Create Failed, Response: ${response.status}`;
        setErrorMessage(errorMsg);
        setToast({ message: errorMsg, type: 'error' });
      }
    } catch (e) {
      const errorMsg = handleApiError(e);
      setErrorMessage(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1>Create Exercise</h1>
      <form id="exerciseInfo" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Your Details</legend>

          <p>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </p>

          <p>
            <label htmlFor="reps">Reps</label>
            <input
              id="reps"
              type="number"
              min="1"
              value={reps}
              onChange={(e) => setReps(e.target.valueAsNumber)}
            />
          </p>

          <p>
            <label htmlFor="weight">Weight</label>
            <input
              id="weight"
              type="number"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.valueAsNumber)}
            />
          </p>

          <p>
            <label htmlFor="unit">Unit</label>
            <select id="unit" name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {VALID_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </p>

          <p>
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </p>
          <p>
            <label htmlFor="save">Click to </label>
            <button id="save" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'SAVE'}
            </button>
          </p>
          {errorMessage && <p role="alert">{errorMessage}</p>}
        </fieldset>
      </form>
    </div>
  );
};

export default CreateExercisePage;
