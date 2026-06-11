import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyLoans, getNotifications, getMyKyc } from '../../services/api';
import KycStatusCard from '../../components/kyc/KycStatusCard';
import KycDocumentsViewer from '../../components/kyc/KycDocumentsViewer';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Customer';
  const [loans, setLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansResponse, notificationsResponse, kycResponse] = await Promise.all([
        getMyLoans(),
        getNotifications(),
        getMyKyc(),
      ]);
      setLoans(loansResponse.data);
      setNotifications(notificationsResponse.data);
      setKyc(kycResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const totalLoans = loans.length;
  const pendingLoans = loans.filter(l => l.status === 'PENDING').length;
  const approvedLoans = loans.filter(l => l.status === 'APPROVED').length;
  const rejectedLoans = loans.filter(l => l.status === 'REJECTED').length;

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
              <a className="nav-link active" href="/customer/dashboard" style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>Dashboard</a>
              <a className="nav-link" href="/customer/kyc" style={{ color: '#333333' }}>KYC Verification</a>
              <a className="nav-link" href="/customer/apply/personal" style={{ color: '#333333' }}>Apply Personal Loan</a>
              <a className="nav-link" href="/customer/apply/vehicle" style={{ color: '#333333' }}>Apply Vehicle Loan</a>
              <a className="nav-link" href="/customer/apply/home" style={{ color: '#333333' }}>Apply Home Loan</a>
              <a className="nav-link" href="/customer/my-loans" style={{ color: '#333333' }}>My Loans</a>
              <a className="nav-link" href="/customer/notifications" style={{ color: '#333333' }}>Notifications</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '30px' }}>Welcome, {userName}</h2>

            {!loading && notifications.some((n) => !n.read) && (
              <div
                className="alert mb-4"
                style={{ backgroundColor: '#e7f3ff', border: '1px solid #4A90D9', color: '#333333' }}
              >
                You have unread notifications.{' '}
                <a href="/customer/notifications" style={{ color: '#4A90D9' }}>
                  View all
                </a>
              </div>
            )}

            <KycStatusCard kyc={kyc} loading={loading} />
            {!loading && kyc?.status === 'COMPLETED' && (
              <div className="mb-4">
                <h4 style={{ color: '#333333', marginBottom: '16px' }}>KYC Documents</h4>
                <KycDocumentsViewer kyc={kyc} />
              </div>
            )}

            {loading ? (
              <p style={{ color: '#333333' }}>Loading...</p>
            ) : (
              <>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#333333', marginBottom: '10px' }}>{totalLoans}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Total Loans</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#FFA500', marginBottom: '10px' }}>{pendingLoans}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Pending Loans</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#28a745', marginBottom: '10px' }}>{approvedLoans}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Approved Loans</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>{rejectedLoans}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Rejected Loans</p>
                    </div>
                  </div>
                </div>

                <h4 style={{ color: '#333333', marginBottom: '20px' }}>Recent Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={{ color: '#333333' }}>No notifications</p>
                ) : (
                  <div className="row">
                    {notifications.slice(0, 3).map((notification) => (
                      <div className="col-md-12 mb-3" key={notification.id}>
                        <div className="card" style={{ border: '1px solid #dee2e6', padding: '15px', backgroundColor: notification.read ? '#FFFFFF' : '#FFFACD' }}>
                          <p style={{ color: '#333333', margin: 0 }}>{notification.message}</p>
                          <small style={{ color: '#666' }}>{new Date(notification.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
