import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOfficerLoansByStatus, getOfficerLoanCounts, reviewLoan, getOfficerCustomerKyc } from '../../services/api';
import KycDocumentsViewer from '../../components/kyc/KycDocumentsViewer';
import LoanDocumentViewer from '../../components/loan/LoanDocumentViewer';
import { formatLoanTerm } from '../../utils/loanUtils';
import { getLoanDocumentConfig } from '../../utils/loanDocumentUtils';

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Officer';
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loans, setLoans] = useState([]);
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [loading, setLoading] = useState(true);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoanDetailsModal, setShowLoanDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [detailsLoan, setDetailsLoan] = useState(null);

  const [profileLoan, setProfileLoan] = useState(null);
  const [reviewLoanData, setReviewLoanData] = useState(null);
  const [comment, setComment] = useState('');
  const [customerKyc, setCustomerKyc] = useState(null);

  const closeAllModals = useCallback(() => {
    setShowProfileModal(false);
    setShowLoanDetailsModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setProfileLoan(null);
    setDetailsLoan(null);
    setReviewLoanData(null);
    setComment('');
    setCustomerKyc(null);
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const response = await getOfficerLoanCounts();
      setCounts(response.data);
    } catch (error) {
      console.error('Error fetching loan counts:', error);
    }
  }, []);

  const fetchLoans = useCallback(async (status) => {
    setLoading(true);
    try {
      const response = await getOfficerLoansByStatus(status);
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchLoans(activeTab);
  }, [activeTab, fetchCounts, fetchLoans]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleTabChange = (tabKey) => {
    closeAllModals();
    setActiveTab(tabKey);
  };

  const handleApprove = (loan, event) => {
    event.stopPropagation();
    closeAllModals();
    setReviewLoanData(loan);
    setComment('');
    setShowApproveModal(true);
  };

  const handleReject = (loan, event) => {
    event.stopPropagation();
    closeAllModals();
    setReviewLoanData(loan);
    setComment('');
    setShowRejectModal(true);
  };

  const handleViewLoanDetails = (loan, event) => {
    event.stopPropagation();
    closeAllModals();
    setDetailsLoan(loan);
    setShowLoanDetailsModal(true);
  };

  const handleViewCustomerProfile = async (loan, event) => {
    event.stopPropagation();
    closeAllModals();
    try {
      const userId = loan.customer?.id;
      if (!userId) {
        alert('Customer information not available');
        return;
      }
      const response = await getOfficerCustomerKyc(userId);
      setProfileLoan(loan);
      setCustomerKyc(response.data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching customer KYC:', error);
      alert('Failed to load customer profile');
    }
  };

  const handleSubmitReview = async (action) => {
    if (!comment.trim()) {
      alert('Please provide a comment');
      return;
    }

    try {
      await reviewLoan(reviewLoanData.id, action, comment);
      closeAllModals();
      fetchCounts();
      fetchLoans(activeTab);
    } catch (error) {
      console.error('Error reviewing loan:', error);
      alert('Failed to review loan');
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return '₹' + Number(amount).toLocaleString('en-IN');
  };

  const getSalary = () => {
    const income = profileLoan?.monthlyIncome ?? customerKyc?.monthlyIncome;
    return income != null ? formatCurrency(income) : '-';
  };

  const getCreditScore = () => {
    const score = customerKyc?.creditScore ?? profileLoan?.creditScore;
    return score != null ? score : '-';
  };

  const formatDecisionSource = (loan) => {
    if (loan.decisionSource === 'AUTO_SYSTEM') {
      if (loan.status === 'APPROVED') return 'Automatically Approved';
      if (loan.status === 'REJECTED') return 'Automatically Rejected';
      return 'AUTO_SYSTEM';
    }
    if (loan.decisionSource === 'LOAN_OFFICER') {
      if (loan.status === 'APPROVED') return 'Approved by Officer';
      if (loan.status === 'REJECTED') return 'Rejected by Officer';
      return 'Loan Officer Review';
    }
    return loan.decisionSource || '-';
  };

  const getDecisionDate = (loan) => {
    if (loan.status === 'APPROVED') {
      return loan.approvedAt || loan.reviewedAt || loan.appliedAt;
    }
    if (loan.status === 'REJECTED') {
      return loan.rejectedAt || loan.reviewedAt || loan.appliedAt;
    }
    return loan.appliedAt;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span style={{ backgroundColor: '#28a745', color: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
          Approved
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span style={{ backgroundColor: '#dc3545', color: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
          Rejected
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: '#FFA500', color: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
        {status}
      </span>
    );
  };

  const isPendingTab = activeTab === 'PENDING';

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <nav className="navbar navbar-light" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #dee2e6' }}>
        <div className="container-fluid">
          <span className="navbar-brand" style={{ color: '#333333' }}>Loan Management - Officer Panel</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#333333' }}>{userName}</span>
            <button className="btn btn-sm" onClick={handleLogout} style={{ backgroundColor: '#4A90D9', color: '#FFFFFF', border: 'none' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid" style={{ padding: '30px' }}>
        <h2 style={{ color: '#333333', marginBottom: '20px' }}>Loan Applications</h2>

        <ul className="nav nav-tabs mb-4">
          {TABS.map((tab) => (
            <li className="nav-item" key={tab.key}>
              <button
                type="button"
                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  color: activeTab === tab.key ? '#4A90D9' : '#333333',
                  fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                {tab.label} ({counts[tab.key] ?? 0})
              </button>
            </li>
          ))}
        </ul>

        {loading ? (
          <p style={{ color: '#333333' }}>Loading...</p>
        ) : loans.length === 0 ? (
          <p style={{ color: '#333333' }}>No {activeTab.toLowerCase()} applications</p>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ backgroundColor: '#FFFFFF' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F9FA' }}>
                  <th style={{ color: '#333333' }}>Loan ID</th>
                  <th style={{ color: '#333333' }}>Customer</th>
                  <th style={{ color: '#333333' }}>Loan Type</th>
                  <th style={{ color: '#333333' }}>Amount</th>
                  <th style={{ color: '#333333' }}>Term</th>
                  <th style={{ color: '#333333' }}>Credit Score</th>
                  <th style={{ color: '#333333' }}>Status</th>
                  <th style={{ color: '#333333' }}>Decision Source</th>
                  <th style={{ color: '#333333' }}>Decision Date</th>
                  <th style={{ color: '#333333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td style={{ color: '#333333' }}>{loan.id}</td>
                    <td style={{ color: '#333333' }}>{loan.customer?.fullName}</td>
                    <td style={{ color: '#333333' }}>{loan.loanType}</td>
                    <td style={{ color: '#333333' }}>{formatCurrency(loan.loanAmount)}</td>
                    <td style={{ color: '#333333' }}>{formatLoanTerm(loan)}</td>
                    <td style={{ color: '#333333' }}>{loan.creditScore ?? '-'}</td>
                    <td>{getStatusBadge(loan.status)}</td>
                    <td style={{ color: '#333333' }}>{formatDecisionSource(loan)}</td>
                    <td style={{ color: '#333333' }}>{formatDate(getDecisionDate(loan))}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm me-2"
                        onClick={(e) => handleViewLoanDetails(loan, e)}
                        style={{ backgroundColor: '#4A90D9', color: '#FFFFFF', border: 'none', marginRight: '5px' }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm me-2"
                        onClick={(e) => handleViewCustomerProfile(loan, e)}
                        style={{ backgroundColor: '#17a2b8', color: '#FFFFFF', border: 'none', marginRight: '5px' }}
                      >
                        Profile
                      </button>
                      {isPendingTab && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm me-2"
                            onClick={(e) => handleApprove(loan, e)}
                            style={{ backgroundColor: '#28a745', color: '#FFFFFF', border: 'none', marginRight: '5px' }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={(e) => handleReject(loan, e)}
                            style={{ backgroundColor: '#dc3545', color: '#FFFFFF', border: 'none' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showApproveModal && reviewLoanData && (
        <div
          className="modal show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeAllModals}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#333333' }}>Approve Loan #{reviewLoanData.id}</h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Comment</label>
                  <textarea
                    className="form-control"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    placeholder="Enter approval comment"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeAllModals}
                  style={{ backgroundColor: '#6c757d', color: '#FFFFFF', border: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleSubmitReview('APPROVE')}
                  style={{ backgroundColor: '#28a745', color: '#FFFFFF', border: 'none' }}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && reviewLoanData && (
        <div
          className="modal show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeAllModals}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#333333' }}>Reject Loan #{reviewLoanData.id}</h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Comment</label>
                  <textarea
                    className="form-control"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    placeholder="Enter rejection comment"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeAllModals}
                  style={{ backgroundColor: '#6c757d', color: '#FFFFFF', border: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleSubmitReview('REJECT')}
                  style={{ backgroundColor: '#dc3545', color: '#FFFFFF', border: 'none' }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoanDetailsModal && detailsLoan && (
        <div
          className="modal show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeAllModals}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#333333' }}>
                  Loan Details — #{detailsLoan.id}
                </h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <h6 style={{ color: '#333333', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                  Application Information
                </h6>
                <div className="row mb-4">
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Customer: </span>
                    <span style={{ color: '#333333' }}>{detailsLoan.customer?.fullName || '-'}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Loan Type: </span>
                    <span style={{ color: '#333333' }}>{detailsLoan.loanType}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Amount: </span>
                    <span style={{ color: '#333333' }}>{formatCurrency(detailsLoan.loanAmount)}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Loan Term: </span>
                    <span style={{ color: '#333333' }}>{formatLoanTerm(detailsLoan)}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Status: </span>
                    {getStatusBadge(detailsLoan.status)}
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Credit Score: </span>
                    <span style={{ color: '#333333' }}>{detailsLoan.creditScore ?? '-'}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Decision Source: </span>
                    <span style={{ color: '#333333' }}>{formatDecisionSource(detailsLoan)}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Applied Date: </span>
                    <span style={{ color: '#333333' }}>{formatDate(detailsLoan.appliedAt)}</span>
                  </div>
                </div>

                {getLoanDocumentConfig(detailsLoan.loanType) && (
                  <>
                    <h6 style={{ color: '#333333', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                      Loan Application Documents
                    </h6>
                    <LoanDocumentViewer loan={detailsLoan} isOfficer />
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeAllModals}
                  style={{ backgroundColor: '#6c757d', color: '#FFFFFF', border: 'none' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && profileLoan && customerKyc && (
        <div
          className="modal show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeAllModals}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#333333' }}>
                  Customer Profile — {customerKyc.fullName}
                </h5>
                <button type="button" className="btn-close" onClick={closeAllModals}></button>
              </div>
              <div className="modal-body">
                <h6 style={{ color: '#333333', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                  Customer Information
                </h6>
                <div className="row mb-4">
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Name: </span>
                    <span style={{ color: '#333333' }}>{customerKyc.fullName}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Email: </span>
                    <span style={{ color: '#333333' }}>{customerKyc.email}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Mobile: </span>
                    <span style={{ color: '#333333' }}>{customerKyc.mobileNumber || '-'}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Salary: </span>
                    <span style={{ color: '#333333' }}>{getSalary()}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Credit Score: </span>
                    <span style={{ color: '#333333' }}>{getCreditScore()}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>KYC Status: </span>
                    <span style={{ color: customerKyc.kycStatus === 'COMPLETED' ? '#28a745' : '#ffc107', fontWeight: 'bold' }}>
                      {customerKyc.kycStatus}
                    </span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <span style={{ color: '#666' }}>Loan Term: </span>
                    <span style={{ color: '#333333' }}>{formatLoanTerm(profileLoan)}</span>
                  </div>
                  <div className="col-12 mb-2">
                    <span style={{ color: '#666' }}>Address: </span>
                    <span style={{ color: '#333333' }}>{profileLoan.address || customerKyc.address || 'Not available'}</span>
                  </div>
                  {profileLoan.officerComment && (
                    <div className="col-12 mb-2">
                      <span style={{ color: '#666' }}>Review Comment: </span>
                      <span style={{ color: '#333333' }}>{profileLoan.officerComment}</span>
                    </div>
                  )}
                </div>

                <h6 style={{ color: '#333333', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                  KYC Documents
                </h6>
                {customerKyc.kycStatus === 'COMPLETED' ? (
                  <KycDocumentsViewer
                    kyc={{
                      status: customerKyc.kycStatus,
                      aadhaarFile: customerKyc.aadhaarFile,
                      panFile: customerKyc.panFile,
                    }}
                    officerUserId={customerKyc.userId}
                  />
                ) : (
                  <p style={{ color: '#666' }}>KYC documents are not available yet.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeAllModals}
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

export default OfficerDashboard;
