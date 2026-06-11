import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyLoanWithDocument } from '../../services/api';
import { getLoanDocumentConfig } from '../../utils/loanDocumentUtils';
import KycLoanSection from '../../components/kyc/KycLoanSection';
import CreditEligibilityBanner from '../../components/loan/CreditEligibilityBanner';

const HomeLoan = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Customer';
  const [formData, setFormData] = useState({
    loanAmount: '',
    loanTerm: '',
    purpose: '',
    age: '',
    address: '',
    occupation: '',
    monthlyIncome: '',
    propertyLocation: ''
  });
  const [propertyDocumentFile, setPropertyDocumentFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const documentConfig = getLoanDocumentConfig('HOME_LOAN');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.loanAmount || formData.loanAmount < 1000) {
      setError('Loan amount must be at least 1000');
      return;
    }

    if (!formData.loanTerm || formData.loanTerm < 6 || formData.loanTerm > 360) {
      setError('Loan term must be between 6 and 360 months');
      return;
    }

    if (!formData.age || formData.age < 21 || formData.age > 60) {
      setError('Age must be between 21 and 60');
      return;
    }

    if (!formData.monthlyIncome || formData.monthlyIncome < 0) {
      setError('Monthly income must be positive');
      return;
    }

    if (!formData.propertyLocation) {
      setError('Please enter property location');
      return;
    }

    if (!propertyDocumentFile) {
      setError('Please upload your Property Document before submitting');
      return;
    }

    setLoading(true);
    try {
      const { loanTerm, ...rest } = formData;
      await applyLoanWithDocument(
        'HOME_LOAN',
        { ...rest, loanTermMonths: loanTerm },
        documentConfig.type,
        propertyDocumentFile
      );
      setSuccess('Loan application submitted successfully');
      setPropertyDocumentFile(null);
      setFormData({
        loanAmount: '',
        loanTerm: '',
        purpose: '',
        age: '',
        address: '',
        occupation: '',
        monthlyIncome: '',
        propertyLocation: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
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
              <a className="nav-link" href="/customer/kyc" style={{ color: '#333333' }}>KYC Verification</a>
              <a className="nav-link" href="/customer/apply/personal" style={{ color: '#333333' }}>Apply Personal Loan</a>
              <a className="nav-link" href="/customer/apply/vehicle" style={{ color: '#333333' }}>Apply Vehicle Loan</a>
              <a className="nav-link active" href="/customer/apply/home" style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>Apply Home Loan</a>
              <a className="nav-link" href="/customer/my-loans" style={{ color: '#333333' }}>My Loans</a>
              <a className="nav-link" href="/customer/notifications" style={{ color: '#333333' }}>Notifications</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '30px' }}>Apply for Home Loan</h2>

            <CreditEligibilityBanner />

            <KycLoanSection />

            <div className="card" style={{ border: '1px solid #dee2e6', padding: '30px' }}>
              {error && (
                <div className="alert alert-danger mb-3" style={{ backgroundColor: '#f8d7da', color: '#721c24', border: 'none' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-3" style={{ backgroundColor: '#d4edda', color: '#155724', border: 'none' }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Loan Amount</label>
                    <input
                      type="number"
                      name="loanAmount"
                      className="form-control"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      placeholder="Enter loan amount"
                      min="1000"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Loan Term (Months)</label>
                    <input
                      type="number"
                      name="loanTerm"
                      className="form-control"
                      value={formData.loanTerm}
                      onChange={handleChange}
                      placeholder="Enter loan term in months"
                      min="6"
                      max="360"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Purpose</label>
                    <input
                      type="text"
                      name="purpose"
                      className="form-control"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Enter loan purpose"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Age</label>
                    <input
                      type="number"
                      name="age"
                      className="form-control"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter your age"
                      min="21"
                      max="60"
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      className="form-control"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="Enter your occupation"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Monthly Income</label>
                    <input
                      type="number"
                      name="monthlyIncome"
                      className="form-control"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      placeholder="Enter monthly income"
                      min="0"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Property Location</label>
                    <input
                      type="text"
                      name="propertyLocation"
                      className="form-control"
                      value={formData.propertyLocation}
                      onChange={handleChange}
                      placeholder="Enter property location"
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>
                      Property Document <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPropertyDocumentFile(e.target.files?.[0] || null)}
                      required
                    />
                    <small style={{ color: '#666' }}>PDF, JPG, JPEG, or PNG (max 10 MB)</small>
                  </div>

                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ backgroundColor: '#4A90D9', border: 'none' }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoan;
