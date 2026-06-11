import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLoans, getReport } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Admin';
  const [loans, setLoans] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const loansResponse = await getAllLoans();
      const reportResponse = await getReport();
      setLoans(loansResponse.data);
      setReport(reportResponse.data);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ backgroundColor: '#FFA500', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>PENDING</span>;
      case 'APPROVED':
        return <span style={{ backgroundColor: '#28a745', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>APPROVED</span>;
      case 'REJECTED':
        return <span style={{ backgroundColor: '#dc3545', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>REJECTED</span>;
      case 'CONDITIONAL_APPROVAL':
        return <span style={{ backgroundColor: '#007bff', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>CONDITIONAL APPROVAL</span>;
      default:
        return <span style={{ backgroundColor: '#6c757d', color: '#FFFFFF', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>{status}</span>;
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + Number(amount).toLocaleString('en-IN');
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
              <a className="nav-link active" href="/admin/dashboard" style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>Dashboard</a>
              <a className="nav-link" href="/admin/users" style={{ color: '#333333' }}>Manage Users</a>
              <a className="nav-link" href="/admin/reports" style={{ color: '#333333' }}>Reports</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '30px' }}>Dashboard</h2>

            {loading ? (
              <p style={{ color: '#333333' }}>Loading...</p>
            ) : (
              <>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#333333', marginBottom: '10px' }}>{report?.totalLoans ?? 0}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Total Loans</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#28a745', marginBottom: '10px' }}>{report?.approved ?? 0}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Approved Loans</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>{report?.rejected ?? 0}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Rejected Loans</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card" style={{ border: '1px solid #dee2e6', padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ color: '#FFA500', marginBottom: '10px' }}>{report?.pending ?? 0}</h3>
                      <p style={{ color: '#333333', margin: 0 }}>Pending Loans</p>
                    </div>
                  </div>
                </div>

                <h4 style={{ color: '#333333', marginBottom: '20px' }}>Recent Loans</h4>
                {loans.length === 0 ? (
                  <p style={{ color: '#333333' }}>No loans found</p>
                ) : (
                  <table className="table" style={{ backgroundColor: '#FFFFFF' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8F9FA' }}>
                        <th style={{ color: '#333333' }}>Loan ID</th>
                        <th style={{ color: '#333333' }}>Customer Name</th>
                        <th style={{ color: '#333333' }}>Loan Type</th>
                        <th style={{ color: '#333333' }}>Amount</th>
                        <th style={{ color: '#333333' }}>Status</th>
                        <th style={{ color: '#333333' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.slice(0, 10).map((loan) => (
                        <tr key={loan.id}>
                          <td style={{ color: '#333333' }}>{loan.id}</td>
                          <td style={{ color: '#333333' }}>{loan.customer?.fullName}</td>
                          <td style={{ color: '#333333' }}>{loan.loanType}</td>
                          <td style={{ color: '#333333' }}>{formatCurrency(loan.loanAmount)}</td>
                          <td>{getStatusBadge(loan.status)}</td>
                          <td style={{ color: '#333333' }}>{new Date(loan.appliedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
