import '../App.css';
import { FaEdit } from "react-icons/fa";

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
            <td> <FaEdit onClick={() => onEdit(exercise)} /></td>
        </tr>
    );
}
//fixme look at movie page onedit logic
export default ExerciseRow;