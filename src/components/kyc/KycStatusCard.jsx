import React from 'react';
import { useNavigate } from 'react-router-dom';

const KycStatusCard = ({ kyc, loading }) => {
  const navigate = useNavigate();
  const isCompleted = kyc?.status === 'COMPLETED';

  if (loading) {
    return (
      <div className="card mb-4" style={{ border: '1px solid #dee2e6', padding: '20px' }}>
        <p style={{ color: '#333333', margin: 0 }}>Loading KYC status...</p>
      </div>
    );
  }

  return (
    <div
      className="card mb-4"
      style={{
        border: `2px solid ${isCompleted ? '#28a745' : '#ffc107'}`,
        padding: '20px',
        backgroundColor: isCompleted ? '#f0fff4' : '#fffbea',
      }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h5 style={{ color: '#333333', marginBottom: '8px' }}>KYC Verification</h5>
          <p
            style={{
              color: isCompleted ? '#28a745' : '#856404',
              margin: 0,
              fontWeight: 'bold',
            }}
          >
            {isCompleted ? 'KYC Completed ✓' : 'KYC Pending'}
          </p>
        </div>
        {!isCompleted && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/customer/kyc')}
            style={{ backgroundColor: '#4A90D9', border: 'none' }}
          >
            Complete KYC
          </button>
        )}
      </div>
    </div>
  );
};

export default KycStatusCard;
