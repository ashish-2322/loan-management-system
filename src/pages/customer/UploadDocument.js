import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, getMyDocuments } from '../../services/api';

const UploadDocument = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Customer';
  const [formData, setFormData] = useState({
    loanId: '',
    documentType: '',
    file: null
  });
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getMyDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.loanId || !formData.documentType || !formData.file) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await uploadDocument(formData.loanId, formData.documentType, formData.file);
      setSuccess('Document uploaded successfully');
      setFormData({
        loanId: '',
        documentType: '',
        file: null
      });
      fetchDocuments();
    } catch (err) {
      setError('Failed to upload document. Please try again.');
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
              <a className="nav-link" href="/customer/apply/personal" style={{ color: '#333333' }}>Apply Personal Loan</a>
              <a className="nav-link" href="/customer/apply/vehicle" style={{ color: '#333333' }}>Apply Vehicle Loan</a>
              <a className="nav-link" href="/customer/apply/home" style={{ color: '#333333' }}>Apply Home Loan</a>
              <a className="nav-link" href="/customer/my-loans" style={{ color: '#333333' }}>My Loans</a>
              <a className="nav-link" href="/customer/notifications" style={{ color: '#333333' }}>Notifications</a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '30px' }}>Upload Documents</h2>

            <div className="card" style={{ border: '1px solid #dee2e6', padding: '30px', marginBottom: '30px' }}>
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
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Loan ID</label>
                    <input
                      type="number"
                      name="loanId"
                      className="form-control"
                      value={formData.loanId}
                      onChange={handleChange}
                      placeholder="Enter loan ID"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Document Type</label>
                    <select
                      name="documentType"
                      className="form-control"
                      value={formData.documentType}
                      onChange={handleChange}
                    >
                      <option value="">Select Document Type</option>
                      <option value="AADHAAR">AADHAAR</option>
                      <option value="PAN">PAN</option>
                      <option value="SALARY_SLIP">SALARY SLIP</option>
                      <option value="BANK_STATEMENT">BANK STATEMENT</option>
                      <option value="PROPERTY_DOCUMENT">PROPERTY DOCUMENT</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>File</label>
                    <input
                      type="file"
                      name="file"
                      className="form-control"
                      onChange={handleChange}
                      accept=".pdf,.jpg,.png"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ backgroundColor: '#4A90D9', border: 'none' }}
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>
            </div>

            <h4 style={{ color: '#333333', marginBottom: '20px' }}>Uploaded Documents</h4>
            {documents.length === 0 ? (
              <p style={{ color: '#333333' }}>No documents uploaded yet</p>
            ) : (
              <table className="table" style={{ backgroundColor: '#FFFFFF' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F9FA' }}>
                    <th style={{ color: '#333333' }}>Document Type</th>
                    <th style={{ color: '#333333' }}>File Name</th>
                    <th style={{ color: '#333333' }}>Uploaded Date</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ color: '#333333' }}>{doc.documentType}</td>
                      <td style={{ color: '#333333' }}>{doc.fileName}</td>
                      <td style={{ color: '#333333' }}>{new Date(doc.uploadedDate).toLocaleDateString()}</td>
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

export default UploadDocument;
