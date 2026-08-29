import { TiDelete } from 'react-icons/ti';
import { fetchWithTimeout } from '../utils/api';

function DeleteIcon({ exercise, setExercises }) {
  const deleteExercise = async () => {
    const confirmed = window.confirm(`Delete "${exercise.name}"?`);

    if (!confirmed) {
      return;
    }

    // Was raw fetch() with no Authorization header — DELETE /exercises/:id
    // requires auth, so every delete-from-list attempt got a 401.
    const response = await fetchWithTimeout(`/exercises/${exercise._id}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      setExercises((currentExercises) =>
        currentExercises.filter((item) => item._id !== exercise._id)
      );
      alert('Deleted');
    } else {
      alert(`Failed to delete exercise with id: ${exercise._id}, status code: ${response.status}`);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      deleteExercise();
    }
  };

  return (
    <TiDelete
      onClick={deleteExercise}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Delete ${exercise.name}`}
    />
  );
}

export default DeleteIcon;
