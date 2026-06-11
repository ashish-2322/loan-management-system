import React, { useState } from 'react';
import {
  getCustomerLoanDocuments,
  downloadCustomerLoanDocument,
  getLoanDocuments,
  downloadDocument,
} from '../../services/api';
import { getLoanDocumentConfig, getDisplayFileName } from '../../utils/loanDocumentUtils';
import { getBlobFromResponse, openBlobPreview } from '../../utils/kycDocumentUtils';

const LoanDocumentViewer = ({ loan, isOfficer = false }) => {
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  const config = getLoanDocumentConfig(loan?.loanType);
  const label = config?.label || 'Loan Document';

  React.useEffect(() => {
    if (!loan?.id) return;
    let cancelled = false;
    const fetchDocs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = isOfficer
          ? await getLoanDocuments(loan.id)
          : await getCustomerLoanDocuments(loan.id);
        if (!cancelled) {
          setDocuments(response.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load loan documents.');
          setDocuments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchDocs();
    return () => {
      cancelled = true;
    };
  }, [loan?.id, isOfficer]);

  const resolveDocument = () => {
    if (!documents || documents.length === 0) return null;
    if (config?.type) {
      return documents.find((d) => d.documentType === config.type) || documents[0];
    }
    return documents[0];
  };

  const doc = resolveDocument();

  const fetchBlob = async (documentId, inline) => {
    if (isOfficer) {
      return downloadDocument(documentId, inline);
    }
    return downloadCustomerLoanDocument(documentId, inline);
  };

  const handleDownload = async (event) => {
    event?.stopPropagation();
    if (!doc) return;
    setError('');
    setDownloading('download');
    try {
      const response = await fetchBlob(doc.id, false);
      const fileName = getDisplayFileName(doc);
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

  const handleView = async (event) => {
    event?.stopPropagation();
    if (!doc) return;
    setError('');
    setDownloading('view');
    try {
      const response = await fetchBlob(doc.id, true);
      const blob = getBlobFromResponse(response, getDisplayFileName(doc));
      openBlobPreview(blob);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to preview document.');
    } finally {
      setDownloading(null);
    }
  };

  if (!loan) return null;

  return (
    <div className="card" style={{ border: '1px solid #dee2e6', padding: '16px' }}>
      <h6 style={{ color: '#333333' }}>{label}</h6>
      {error && (
        <div className="alert alert-danger mb-2" style={{ border: 'none', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {loading ? (
        <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
      ) : !doc ? (
        <p style={{ color: '#666', fontSize: '14px' }}>No document uploaded for this loan.</p>
      ) : (
        <>
          <p style={{ color: '#666', fontSize: '14px' }}>{getDisplayFileName(doc)}</p>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={!!downloading}
              onClick={handleView}
            >
              {downloading === 'view' ? 'Opening...' : 'View'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              style={{ backgroundColor: '#4A90D9', border: 'none' }}
              disabled={!!downloading}
              onClick={handleDownload}
            >
              {downloading === 'download' ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanDocumentViewer;
