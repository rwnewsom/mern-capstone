import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navigation() {
  const { isAuthenticated, username, role, logout } = useAuth();

  return (
    <header className="navigation-header">
      <div className="header-content">
        <div className="header-title">
          <h1>Exercise Tracker</h1>
          <p>For OSU Beavers that are Buff, Buff curious, or Buff positive</p>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-section">
              <span className="user-info">
                {role === 'admin' && <span className="admin-badge">Admin</span>}
                <span className="username">{username}</span>
              </span>
              {role === 'admin' && (
                <Link to="/admin" className="btn-link btn-admin">
                  Admin Panel
                </Link>
              )}
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-section">
              <Link to="/login" className="btn-link btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-link btn-signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navigation-header {
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          padding: 20px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .header-title {
          flex: 1;
        }

        .header-title h1 {
          margin: 0;
          color: var(--text-primary);
          font-size: 24px;
          font-weight: 600;
        }

        .header-title p {
          margin: 5px 0 0 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          font-size: 14px;
        }

        .admin-badge {
          background-color: var(--primary-color);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .username {
          font-weight: 500;
        }

        .guest-section {
          display: flex;
          gap: 10px;
        }

        .btn-link {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: transparent;
          color: var(--primary-color);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-link:hover {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .btn-logout {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          background-color: var(--primary-color);
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-logout:hover {
          background-color: var(--primary-hover);
        }

        .btn-admin {
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .nav-actions {
            width: 100%;
            justify-content: space-between;
          }

          .header-title h1 {
            font-size: 20px;
          }

          .header-title p {
            font-size: 12px;
          }
        }
      `}</style>
    </header>
  );
}
