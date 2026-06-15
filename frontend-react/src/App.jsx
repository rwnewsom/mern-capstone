import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import CreateExercisePage from './pages/CreateExercise';
import EditExercisePage from './pages/EditExercise';
import RetrieveExercises from './pages/RetrieveExercises';
import { FaCopyright } from "react-icons/fa";

function App() {
  const [exerciseToEdit, setExerciseToEdit] = useState(null);

  return (
    <div className="main-content">
      <header>
        <h1>Rob's Exercise App</h1>
        <p>For OSU Beavers that are Buff, Buff curious, or Buff positive</p>
      </header>
      
        <Router>
          <nav>
            <Link to="/">Retrieve</Link>
            <Link to="/create">Create</Link>
          </nav>
          <Routes>
            <Route path="/" element={<RetrieveExercises setExerciseToEdit={setExerciseToEdit} />}></Route>
            <Route path="/create" element={<CreateExercisePage/>}></Route>
            <Route path="/update" element={<EditExercisePage exercise={exerciseToEdit} />}></Route>
          </Routes>
        </Router>

        <footer>
          <p> 
            <span>
              <FaCopyright /> All Right Reserved - Author Rob Newsom
            </span>
          </p>
        </footer>
    </div>
  );
}

export default App;