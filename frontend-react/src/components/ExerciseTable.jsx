import ExerciseRow from "./ExerciseRow";

function ExerciseTable({ exercises, DeleteIcon, setExercises, onEdit }) {
    return (
      <div>
        <table>
          <caption> ALL EXERCISES </caption>
          <thead>
            <tr>
              <th>Delete</th>
              <th>Name</th>
              <th>Reps</th>
              <th>Weight</th>
              <th>Unit</th>
              <th>Date</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <ExerciseRow
                exercise={exercise}
                DeleteIcon={DeleteIcon}
                setExercises={setExercises}
                onEdit={onEdit}
                key={exercise._id}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
}

export default ExerciseTable;