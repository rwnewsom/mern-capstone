import { TiDelete } from 'react-icons/ti';

function DeleteIcon({ exercise, setExercises }) {
    const deleteExercise = async () => {
        const response = await fetch(`/exercises/${exercise._id}`, {
            method: 'DELETE'
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

    return <TiDelete onClick={deleteExercise} />;
}

export default DeleteIcon;