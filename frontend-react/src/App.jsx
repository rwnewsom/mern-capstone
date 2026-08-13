import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import CreateExercisePage from './pages/CreateExercise';
import EditExercisePage from './pages/EditExercise';
import RetrieveExercises from './pages/RetrieveExercises';
import AuthPage from './pages/AuthPage';
import ErrorBoundary from './components/ErrorBoundary';
import { FaCopyright } from 'react-icons/fa';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    setIsAuthenticated(!!token);
    setUserEmail(email || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail('');
    navigate('/login');
  };

  return (
    <ErrorBoundary>
      <div className="main-content">
        <header>
          <div className="header-content">
            <div>
              <h1>Exercise Tracker</h1>
              <p>For OSU Beavers that are Buff, Buff curious, or Buff positive</p>
            </div>
            <div className="auth-info">
              {isAuthenticated ? (
                <div className="user-section">
                  <span className="user-email">{userEmail}</span>
                  <button onClick={handleLogout} className="btn-logout">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="guest-section">
                  <Link to="/login" className="btn-link">
                    Login
                  </Link>
                  <Link to="/register" className="btn-link">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

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
      <App />
    </Router>
  );
}

export default AppWrapper;
