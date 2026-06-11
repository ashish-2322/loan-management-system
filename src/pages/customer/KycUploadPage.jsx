import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyKyc, uploadKyc } from '../../services/api';
import KycDocumentsViewer from '../../components/kyc/KycDocumentsViewer';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const KycUploadPage = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Customer';
  const [kyc, setKyc] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadKyc();
  }, []);

  const loadKyc = async () => {
    try {
      const response = await getMyKyc();
      setKyc(response.data);
    } catch (err) {
      console.error('Failed to load KYC', err);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file, label) => {
    if (!file) {
      return `${label} document is required.`;
    }
    if (file.size > MAX_SIZE) {
      return `${label} file must not exceed 5 MB.`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExt = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!allowedExt.includes(ext)) {
      return `${label} must be PDF, JPG, JPEG, or PNG.`;
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type) && ext !== 'jpg') {
      // allow jpg with varying mime types
      if (!allowedExt.includes(ext)) {
        return `${label} must be PDF, JPG, JPEG, or PNG.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const aadhaarError = validateFile(aadhaarFile, 'Aadhaar');
    if (aadhaarError) {
      setError(aadhaarError);
      return;
    }
    const panError = validateFile(panFile, 'PAN');
    if (panError) {
      setError(panError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await uploadKyc(aadhaarFile, panFile);
      setSuccess(response.data?.message || 'KYC completed successfully');
      await loadKyc();
      setAadhaarFile(null);
      setPanFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload KYC documents.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isCompleted = kyc?.status === 'COMPLETED';

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <nav className="navbar navbar-light" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #dee2e6' }}>
        <div className="container-fluid">
          <span className="navbar-brand" style={{ color: '#333333' }}>Loan Management</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#333333' }}>{userName}</span>
            <button
              className="btn btn-sm"
              onClick={handleLogout}
              style={{ backgroundColor: '#4A90D9', color: '#FFFFFF', border: 'none' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          <div
            className="col-md-2"
            style={{
              backgroundColor: '#F8F9FA',
              minHeight: 'calc(100vh - 56px)',
              borderRight: '1px solid #dee2e6',
              padding: '20px 0',
            }}
          >
            <div className="nav flex-column">
              <a className="nav-link" href="/customer/dashboard" style={{ color: '#333333' }}>
                Dashboard
              </a>
              <a
                className="nav-link active"
                href="/customer/kyc"
                style={{ color: '#333333', fontWeight: 'bold', backgroundColor: '#e9ecef' }}
              >
                KYC Verification
              </a>
              <a className="nav-link" href="/customer/apply/personal" style={{ color: '#333333' }}>
                Apply Personal Loan
              </a>
              <a className="nav-link" href="/customer/apply/vehicle" style={{ color: '#333333' }}>
                Apply Vehicle Loan
              </a>
              <a className="nav-link" href="/customer/apply/home" style={{ color: '#333333' }}>
                Apply Home Loan
              </a>
              <a className="nav-link" href="/customer/my-loans" style={{ color: '#333333' }}>
                My Loans
              </a>
              <a className="nav-link" href="/customer/notifications" style={{ color: '#333333' }}>
                Notifications
              </a>
            </div>
          </div>

          <div className="col-md-10" style={{ padding: '30px' }}>
            <h2 style={{ color: '#333333', marginBottom: '20px' }}>KYC Verification</h2>

            {loading ? (
              <p style={{ color: '#333333' }}>Loading...</p>
            ) : isCompleted ? (
              <>
                <div
                  className="alert alert-success mb-4"
                  style={{ backgroundColor: '#d4edda', color: '#155724', border: 'none' }}
                >
                  KYC Completed ✓ — documents cannot be edited or replaced.
                </div>
                <KycDocumentsViewer kyc={kyc} />
              </>
            ) : (
              <div className="card" style={{ border: '1px solid #dee2e6', padding: '30px' }}>
                <p style={{ color: '#856404', fontWeight: 'bold', marginBottom: '20px' }}>KYC Pending</p>
                <p style={{ color: '#333333' }}>
                  Upload your Aadhaar Card and PAN Card (PDF, JPG, JPEG, or PNG — max 5 MB each).
                </p>

                {error && (
                  <div className="alert alert-danger mt-3" style={{ border: 'none' }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success mt-3" style={{ border: 'none' }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>
                      Aadhaar Card *
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setAadhaarFile(e.target.files[0] || null)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>
                      PAN Card *
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPanFile(e.target.files[0] || null)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ backgroundColor: '#4A90D9', border: 'none' }}
                  >
                    {submitting ? 'Uploading...' : 'Submit KYC'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycUploadPage;
