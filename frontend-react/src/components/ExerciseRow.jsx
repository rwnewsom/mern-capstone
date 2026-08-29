import '../App.css';
import { FaEdit } from 'react-icons/fa';

function ExerciseRow({ exercise, DeleteIcon, setExercises, onEdit }) {
  return (
    <tr>
      <td>
        <DeleteIcon exercise={exercise} setExercises={setExercises} />
      </td>
      <td> {exercise.name} </td>
      <td> {exercise.reps} </td>
      <td> {exercise.weight} </td>
      <td> {exercise.unit} </td>
      <td> {exercise.date?.split('T')[0]} </td>
      <td>
        {' '}
        <FaEdit
          onClick={() => onEdit(exercise)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onEdit(exercise);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Edit ${exercise.name}`}
        />
      </td>
    </tr>
  );
}

export default ExerciseRow;
