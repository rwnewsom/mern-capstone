import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchWithTimeout, handleApiError } from '../utils/api';
import Toast from '../components/Toast';

export default function AdminPage() {
  const { token, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithTimeout(`${window.location.origin}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token, loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetchWithTimeout(`${window.location.origin}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      setUsers(users.map((u) => (u._id === userId ? response : u)));
      setToast({
        type: 'success',
        message: `User role updated to ${newRole}`,
      });
    } catch (err) {
      const message = handleApiError(err);
      setToast({ type: 'error', message });
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetchWithTimeout(`${window.location.origin}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      setUsers(users.map((u) => (u._id === userId ? response : u)));
      setToast({
        type: 'success',
        message: `User ${newStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (err) {
      const message = handleApiError(err);
      setToast({ type: 'error', message });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      await fetchWithTimeout(`${window.location.origin}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((u) => u._id !== userId));
      setToast({ type: 'success', message: 'User deleted' });
    } catch (err) {
      const message = handleApiError(err);
      setToast({ type: 'error', message });
    }
  };

  const filteredUsers = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  if (role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="error-box">
          <h2>Access Denied</h2>
          <p>You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel - User Management</h1>

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={loadUsers}>Retry</button>
        </div>
      )}

      <div className="admin-controls">
        <div className="filter-group">
          <label htmlFor="role-filter">Filter by role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Users ({users.length})</option>
            <option value="user">Users ({users.filter((u) => u.role === 'user').length})</option>
            <option value="admin">Admins ({users.filter((u) => u.role === 'admin').length})</option>
          </select>
        </div>
        <button onClick={loadUsers} className="btn-refresh">
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="empty-state">No users found</p>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className={!user.isActive ? 'inactive' : ''}>
                  <td className="username-cell">{user.username}</td>
                  <td className="email-cell">{user.email}</td>
                  <td className="role-cell">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="status-cell">
                    <button
                      className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleStatusChange(user._id, !user.isActive)}
                    >
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-delete" onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-container h1 {
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        .error-box {
          background-color: var(--error-bg, #fee);
          border: 1px solid var(--error-border, #fcc);
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          color: var(--error-text, #c33);
        }

        .error-box button {
          background-color: var(--error-text, #c33);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }

        .error-box button:hover {
          background-color: var(--error-hover, #a22);
        }

        .admin-controls {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .filter-group label {
          color: var(--text-primary);
          font-weight: 500;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 14px;
        }

        .btn-refresh {
          padding: 8px 16px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-refresh:hover {
          background-color: var(--primary-hover);
        }

        .loading,
        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          padding: 40px;
          font-size: 16px;
        }

        .users-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          background-color: var(--bg-secondary);
        }

        .users-table thead {
          background-color: var(--bg-primary);
          border-bottom: 2px solid var(--border-color);
        }

        .users-table th {
          padding: 12px 15px;
          text-align: left;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 14px;
        }

        .users-table td {
          padding: 12px 15px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .users-table tr:hover {
          background-color: var(--bg-hover, rgba(0, 0, 0, 0.02));
        }

        .users-table tr.inactive {
          opacity: 0.7;
        }

        .role-select {
          padding: 6px 10px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 14px;
        }

        .status-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .status-btn.active {
          background-color: var(--success-bg, #efe);
          color: var(--success-text, #3c3);
        }

        .status-btn.inactive {
          background-color: var(--warning-bg, #fee);
          color: var(--warning-text, #c33);
        }

        .status-btn:hover {
          opacity: 0.8;
        }

        .btn-delete {
          padding: 6px 12px;
          background-color: var(--error-text, #c33);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-delete:hover {
          background-color: var(--error-hover, #a22);
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 15px;
          }

          .users-table {
            font-size: 13px;
          }

          .users-table th,
          .users-table td {
            padding: 10px;
          }

          .admin-controls {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-group {
            width: 100%;
          }

          .filter-group select {
            flex: 1;
          }

          .users-table-wrapper {
            font-size: 12px;
          }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
