import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../../services/api';

const ManageUsers = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDeleteClick = (userId) => {
    setDeleteConfirm(userId);
  };

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    return fallback;
  };

  const handleDeleteConfirm = async (userId) => {
    try {
      const response = await deleteUser(userId);
      setDeleteConfirm(null);
      const successMessage =
        typeof response.data === 'string'
          ? response.data
          : response.data?.message || 'User deleted successfully';
      alert(successMessage);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(getErrorMessage(error, 'Failed to delete user'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'CUSTOMER':
        return <span style={{ backgroundColor: '#007bff', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>CUSTOMER</span>;
      case 'LOAN_OFFICER':
        return <span style={{ backgroundColor: '#28a745', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>LOAN OFFICER</span>;
      case 'ADMIN':
        return <span style={{ backgroundColor: '#dc3545', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>ADMIN</span>;
      default:
        return <span style={{ backgroundColor: '#6c757d', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>{role}</span>;
    }
  };

  const formatDateTime = (user) => {
    const value = user.createdAt || user.createdDate || user['created_at'] || user.created_on || user.registrationDate || user.timestamp;
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (num) => num.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <nav className="navbar navbar-light" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #dee2e6' }}>
        <div className="container-fluid">
          <span className="navbar-brand" style={{ color: '#333333' }}>Loan Management - Admin Panel</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#333333' }}>{userName}</span>
            <button className="btn btn-sm" onClick={handleLogout} style={{ backgroundColor: '#4A90D9', color: '#FFFFFF', border: 'none' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2" style={{ backgroundColor: '#F8F9FA', minHeight: 'calc(100vh - 56px)', borderRight: '1px solid #dee2e6', padding: '20px 0' }}>
            <div className="nav flex-column">
              <a className="nav-link" href="/admin/dashboard" style={{ color: '#333333' }}>Dashboard</a>
              <a className="nav-link active" href="/admin/users" style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>Manage Users</a>
              <a className="nav-link" href="/admin/reports" style={{ color: '#333333' }}>Reports</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '30px' }}>Manage Users</h2>

            {loading ? (
              <p style={{ color: '#333333' }}>Loading...</p>
            ) : users.length === 0 ? (
              <p style={{ color: '#333333' }}>No users found</p>
            ) : (
              <table className="table" style={{ backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F9FA' }}>
                    <th style={{ color: '#333333' }}>ID</th>
                    <th style={{ color: '#333333' }}>Full Name</th>
                    <th style={{ color: '#333333' }}>Email</th>
                    <th style={{ color: '#333333' }}>Mobile Number</th>
                    <th style={{ color: '#333333' }}>Role</th>
                    <th style={{ color: '#333333' }}>Created Date</th>
                    <th style={{ color: '#333333' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ color: '#333333' }}>{user.id}</td>
                      <td style={{ color: '#333333' }}>{user.fullName}</td>
                      <td style={{ color: '#333333' }}>{user.email}</td>
                      <td style={{ color: '#333333' }}>{user.mobileNumber}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td style={{ color: '#333333' }}>{formatDateTime(user)}</td>
                      <td>
                        {deleteConfirm === user.id ? (
                          <>
                            <button
                              className="btn btn-sm me-2"
                              onClick={() => handleDeleteConfirm(user.id)}
                              style={{ backgroundColor: '#28a745', color: '#FFFFFF', border: 'none' }}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={handleDeleteCancel}
                              style={{ backgroundColor: '#6c757d', color: '#FFFFFF', border: 'none' }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDeleteClick(user.id)}
                            style={{ backgroundColor: '#dc3545', color: '#FFFFFF', border: 'none' }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
