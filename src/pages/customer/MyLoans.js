import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyLoans } from '../../services/api';
import LoanDocumentViewer from '../../components/loan/LoanDocumentViewer';
import { formatLoanTerm } from '../../utils/loanUtils';
import { getLoanDocumentConfig } from '../../utils/loanDocumentUtils';

const MyLoans = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Customer';
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await getMyLoans();
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
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

  const formatDecisionSource = (source) => {
    if (!source) return '-';
    return source === 'AUTO_SYSTEM' ? 'AUTO SYSTEM' : 'LOAN OFFICER';
  };

  const getDecisionReason = (loan) => {
    if (loan.approvalReason) return loan.approvalReason;
    if (loan.rejectionReason) return loan.rejectionReason;
    if (loan.officerComment) return loan.officerComment;
    return '-';
  };

  const formatCurrency = (amount) => {
    return '₹' + Number(amount).toLocaleString('en-IN');
  };

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLoan(null);
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
              <a className="nav-link active" href="/customer/my-loans" style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>My Loans</a>
              <a className="nav-link" href="/customer/notifications" style={{ color: '#333333' }}>Notifications</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '30px' }}>My Loan Applications</h2>

            {loading ? (
              <p style={{ color: '#333333' }}>Loading...</p>
            ) : loans.length === 0 ? (
              <p style={{ color: '#333333' }}>No loans found</p>
            ) : (
              <table className="table" style={{ backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F9FA' }}>
                    <th style={{ color: '#333333' }}>Loan ID</th>
                    <th style={{ color: '#333333' }}>Loan Type</th>
                    <th style={{ color: '#333333' }}>Amount</th>
                    <th style={{ color: '#333333' }}>Term</th>
                    <th style={{ color: '#333333' }}>Credit Score</th>
                    <th style={{ color: '#333333' }}>Loan Status</th>
                    <th style={{ color: '#333333' }}>Decision Type</th>
                    <th style={{ color: '#333333' }}>Reason</th>
                    <th style={{ color: '#333333' }}>Applied Date</th>
                    <th style={{ color: '#333333' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td style={{ color: '#333333' }}>{loan.id}</td>
                      <td style={{ color: '#333333' }}>{loan.loanType}</td>
                      <td style={{ color: '#333333' }}>{formatCurrency(loan.loanAmount)}</td>
                      <td style={{ color: '#333333' }}>{formatLoanTerm(loan)}</td>
                      <td style={{ color: '#333333' }}>{loan.creditScore}</td>
                      <td>{getStatusBadge(loan.status)}</td>
                      <td style={{ color: '#333333' }}>{formatDecisionSource(loan.decisionSource)}</td>
                      <td style={{ color: '#333333' }}>{getDecisionReason(loan)}</td>
                      <td style={{ color: '#333333' }}>{new Date(loan.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => handleViewDetails(loan)}
                          style={{ backgroundColor: '#4A90D9', color: '#FFFFFF', border: 'none' }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && selectedLoan && (
        <div
          className="modal show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDetailsModal}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#333333' }}>
                  Loan Details — #{selectedLoan.id}
                </h5>
                <button type="button" className="btn-close" onClick={closeDetailsModal}></button>
              </div>
              <div className="modal-body">
                <h6 style={{ color: '#333333', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                  Application Information
                </h6>
                <div className="row mb-4">
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Loan Type: </span>
                    <span style={{ color: '#333333' }}>{selectedLoan.loanType}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Amount: </span>
                    <span style={{ color: '#333333' }}>{formatCurrency(selectedLoan.loanAmount)}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Loan Term: </span>
                    <span style={{ color: '#333333' }}>{formatLoanTerm(selectedLoan)}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Status: </span>
                    {getStatusBadge(selectedLoan.status)}
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Credit Score: </span>
                    <span style={{ color: '#333333' }}>{selectedLoan.creditScore ?? '-'}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Applied Date: </span>
                    <span style={{ color: '#333333' }}>{new Date(selectedLoan.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {getLoanDocumentConfig(selectedLoan.loanType) && (
                  <>
                    <h6 style={{ color: '#333333', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                      Loan Application Documents
                    </h6>
                    <LoanDocumentViewer loan={selectedLoan} />
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeDetailsModal}
                  style={{ backgroundColor: '#6c757d', color: '#FFFFFF', border: 'none' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
