import React, { useEffect, useState } from 'react';
import { getCustomerProfile } from '../../services/api';

const getEligibility = (score) => {
  if (score == null) {
    return { label: 'Unavailable', color: '#666666' };
  }
  if (score < 650) {
    return { label: 'Auto Rejection', color: '#dc3545' };
  }
  if (score >= 750) {
    return { label: 'Auto Approval', color: '#28a745' };
  }
  return { label: 'Loan Officer Review Required', color: '#FFA500' };
};

const CreditEligibilityBanner = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCustomerProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Error loading credit profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="card mb-4" style={{ border: '1px solid #dee2e6', padding: '20px' }}>
        <p style={{ color: '#333333', margin: 0 }}>Loading credit information...</p>
      </div>
    );
  }

  const eligibility = getEligibility(profile?.creditScore);

  return (
    <div className="card mb-4" style={{ border: '1px solid #dee2e6', padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h5 style={{ color: '#333333', marginBottom: '16px' }}>Credit & Eligibility</h5>
      <div className="row">
        <div className="col-md-6 mb-2">
          <span style={{ color: '#666' }}>Credit Score: </span>
          <span style={{ color: '#333333', fontWeight: 'bold' }}>
            {profile?.creditScore ?? '-'}
          </span>
        </div>
        <div className="col-md-6 mb-2">
          <span style={{ color: '#666' }}>Eligibility: </span>
          <span style={{ color: eligibility.color, fontWeight: 'bold' }}>
            {eligibility.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreditEligibilityBanner;
