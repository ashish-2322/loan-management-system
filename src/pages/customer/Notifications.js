import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '../../services/api';

const Notifications = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Customer';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <nav className="navbar navbar-light" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #dee2e6' }}>
        <div className="container-fluid">
          <span className="navbar-brand" style={{ color: '#333333' }}>Loan Management</span>
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
              <a className="nav-link" href="/customer/dashboard" style={{ color: '#333333' }}>Dashboard</a>
              <a className="nav-link" href="/customer/apply/personal" style={{ color: '#333333' }}>Apply Personal Loan</a>
              <a className="nav-link" href="/customer/apply/vehicle" style={{ color: '#333333' }}>Apply Vehicle Loan</a>
              <a className="nav-link" href="/customer/apply/home" style={{ color: '#333333' }}>Apply Home Loan</a>
              <a className="nav-link" href="/customer/my-loans" style={{ color: '#333333' }}>My Loans</a>
              <a className="nav-link active" href="/customer/notifications" style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>Notifications</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#333333', margin: 0 }}>My Notifications</h2>
              <button
                className="btn btn-sm"
                onClick={handleMarkAllRead}
                style={{ backgroundColor: '#4A90D9', color: '#FFFFFF', border: 'none' }}
              >
                Mark All as Read
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#333333' }}>Loading...</p>
            ) : notifications.length === 0 ? (
              <p style={{ color: '#333333' }}>No notifications</p>
            ) : (
              <div className="row">
                {notifications.map((notification) => (
                  <div className="col-md-12 mb-3" key={notification.id}>
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', backgroundColor: notification.read ? '#FFFFFF' : '#FFFACD' }}>
                      <p style={{ color: '#333333', margin: 0, marginBottom: '10px' }}>{notification.message}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ color: '#666' }}>{new Date(notification.createdAt).toLocaleString()}</small>
                        {notification.read ? (
                          <span style={{ backgroundColor: '#28a745', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>Read</span>
                        ) : (
                          <span style={{ backgroundColor: '#FFA500', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>Unread</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
