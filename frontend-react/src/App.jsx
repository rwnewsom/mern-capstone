import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import CreateExercisePage from './pages/CreateExercise';
import EditExercisePage from './pages/EditExercise';
import RetrieveExercises from './pages/RetrieveExercises';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import { AuthProvider } from './context/AuthContext';
import { FaCopyright } from 'react-icons/fa';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [exerciseToEdit, setExerciseToEdit] = useState(null);

  return (
    <ErrorBoundary>
      <div className="main-content">
        <Navigation />

        <Routes>
          <Route path="/login" element={<AuthPage isRegister={false} />} />
          <Route path="/register" element={<AuthPage isRegister={true} />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>
                  <nav>
                    <Link to="/">Retrieve</Link>
                    <Link to="/create">Create</Link>
                  </nav>
                  <RetrieveExercises setExerciseToEdit={setExerciseToEdit} />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <div>
                  <nav>
                    <Link to="/">Retrieve</Link>
                    <Link to="/create">Create</Link>
                  </nav>
                  <CreateExercisePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/update"
            element={
              <ProtectedRoute>
                <div>
                  <nav>
                    <Link to="/">Retrieve</Link>
                    <Link to="/create">Create</Link>
                  </nav>
                  <EditExercisePage exercise={exerciseToEdit} />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>

        <footer>
          <p>
            <span>
              <FaCopyright /> All Right Reserved - Author Rob Newsom
            </span>
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;
