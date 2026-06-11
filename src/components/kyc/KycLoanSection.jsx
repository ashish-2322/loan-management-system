import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadKycAadhaar, downloadKycPan, getMyKyc } from '../../services/api';
import { getBlobFromResponse, openBlobPreview } from '../../utils/kycDocumentUtils';

const KycLoanSection = () => {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const response = await getMyKyc();
        setKyc(response.data);
      } catch (err) {
        console.error('Error loading KYC:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const openPreview = async (type) => {
    setPreviewLoading(type);
    setError('');
    try {
      const response = type === 'aadhaar'
        ? await downloadKycAadhaar(true)
        : await downloadKycPan(true);
      const fileName = type === 'aadhaar'
        ? kyc?.aadhaarFile || 'aadhaar-document'
        : kyc?.panFile || 'pan-document';
      const blob = getBlobFromResponse(response, fileName);
      openBlobPreview(blob);
    } catch (err) {
      console.error('Preview failed', err);
      setError('Failed to preview document. Please try again.');
    } finally {
      setPreviewLoading(null);
    }
  };

  if (loading) {
    return <p style={{ color: '#333333' }}>Checking KYC status...</p>;
  }

  const isCompleted = kyc?.status === 'COMPLETED';

  if (!isCompleted) {
    return (
      <div className="alert alert-warning mb-4" style={{ backgroundColor: '#fff3cd', border: 'none' }}>
        <strong>KYC required.</strong> Please complete KYC before applying for a loan.{' '}
        <Link to="/customer/kyc">Complete KYC</Link>
      </div>
    );
  }

  return (
    <div className="card mb-4" style={{ border: '1px solid #dee2e6', padding: '20px', backgroundColor: '#f0fff4' }}>
      <h5 style={{ color: '#333333', marginBottom: '12px' }}>Verified KYC Documents</h5>
      <p style={{ color: '#28a745', marginBottom: '8px' }}>Aadhaar Uploaded ✓ — {kyc.aadhaarFile}</p>
      <p style={{ color: '#28a745', marginBottom: '12px' }}>PAN Uploaded ✓ — {kyc.panFile}</p>
      {error && (
        <div className="alert alert-danger mb-3" style={{ border: 'none' }}>
          {error}
        </div>
      )}
      <div className="d-flex gap-3 flex-wrap">
        <button
          type="button"
          className="btn btn-sm btn-link p-0"
          style={{ color: '#4A90D9', textDecoration: 'none' }}
          disabled={!!previewLoading}
          onClick={() => openPreview('aadhaar')}
        >
          {previewLoading === 'aadhaar' ? 'Opening Aadhaar...' : 'Preview Aadhaar'}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-link p-0"
          style={{ color: '#4A90D9', textDecoration: 'none' }}
          disabled={!!previewLoading}
          onClick={() => openPreview('pan')}
        >
          {previewLoading === 'pan' ? 'Opening PAN...' : 'Preview PAN'}
        </button>
      </div>
      <small style={{ color: '#666', display: 'block', marginTop: '10px' }}>
        Your verified KYC documents will be used for this loan application.
      </small>
    </div>
  );
};

export default KycLoanSection;
