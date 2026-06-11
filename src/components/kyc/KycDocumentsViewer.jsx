import React, { useState } from 'react';
import {
  downloadKycAadhaar,
  downloadKycPan,
  downloadOfficerKycAadhaar,
  downloadOfficerKycPan,
} from '../../services/api';
import { getBlobFromResponse, openBlobPreview } from '../../utils/kycDocumentUtils';

const KycDocumentsViewer = ({ kyc, officerUserId = null }) => {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  if (!kyc || kyc.status !== 'COMPLETED') {
    return null;
  }

  const fetchDocument = async (type, inline) => {
    if (type === 'aadhaar') {
      return officerUserId
        ? await downloadOfficerKycAadhaar(officerUserId, inline)
        : await downloadKycAadhaar(inline);
    }
    return officerUserId
      ? await downloadOfficerKycPan(officerUserId, inline)
      : await downloadKycPan(inline);
  };

  const handleDownload = async (type, event) => {
    event?.stopPropagation();
    setError('');
    setDownloading(type);
    try {
      const response = await fetchDocument(type, false);
      const fileName =
        type === 'aadhaar'
          ? kyc.aadhaarFile || 'aadhaar-document'
          : kyc.panFile || 'pan-document';
      const blob = getBlobFromResponse(response, fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download document.');
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (type, event) => {
    event?.stopPropagation();
    setError('');
    setDownloading(`view-${type}`);
    try {
      const response = await fetchDocument(type, true);
      const fileName = type === 'aadhaar' ? kyc.aadhaarFile : kyc.panFile;
      const blob = getBlobFromResponse(response, fileName);
      openBlobPreview(blob);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to preview document.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="row">
      {error && (
        <div className="col-12 mb-3">
          <div className="alert alert-danger" style={{ border: 'none' }}>
            {error}
          </div>
        </div>
      )}
      <div className="col-md-6 mb-3">
        <div className="card h-100" style={{ border: '1px solid #dee2e6', padding: '16px' }}>
          <h6 style={{ color: '#333333' }}>Aadhaar Card</h6>
          <p style={{ color: '#666', fontSize: '14px' }}>{kyc.aadhaarFile}</p>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={!!downloading}
              onClick={(e) => handleView('aadhaar', e)}
            >
              {downloading === 'view-aadhaar' ? 'Opening...' : 'View'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              style={{ backgroundColor: '#4A90D9', border: 'none' }}
              disabled={!!downloading}
              onClick={(e) => handleDownload('aadhaar', e)}
            >
              {downloading === 'aadhaar' ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card h-100" style={{ border: '1px solid #dee2e6', padding: '16px' }}>
          <h6 style={{ color: '#333333' }}>PAN Card</h6>
          <p style={{ color: '#666', fontSize: '14px' }}>{kyc.panFile}</p>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={!!downloading}
              onClick={(e) => handleView('pan', e)}
            >
              {downloading === 'view-pan' ? 'Opening...' : 'View'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              style={{ backgroundColor: '#4A90D9', border: 'none' }}
              disabled={!!downloading}
              onClick={(e) => handleDownload('pan', e)}
            >
              {downloading === 'pan' ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycDocumentsViewer;
