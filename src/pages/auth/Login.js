import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mobileNumber.length !== 10) {
      setError('Mobile number must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(mobileNumber);
      setOtpSent(true);
    } catch (err) {
      setError('User not register. Please register.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(mobileNumber, otp);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userName', response.data.fullName || mobileNumber);
      
      const role = response.data.role;
      if (role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else if (role === 'LOAN_OFFICER') {
        navigate('/officer/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('OTP expired. Please send again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px', border: '1px solid #dee2e6', padding: '30px' }}>
        <h2 style={{ color: '#333333', textAlign: 'center', marginBottom: '10px' }}>Digital Loan Origination System</h2>
        <p style={{ color: '#333333', textAlign: 'center', marginBottom: '30px' }}>Login to your account</p>
        
        {error && (
          <div className="alert alert-danger" style={{ backgroundColor: '#f8d7da', color: '#721c24', border: 'none' }}>
            {error}
          </div>
        )}

        <form>
          <div className="mb-3">
            <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10 digit mobile number"
              maxLength={10}
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <button
              type="submit"
              className="btn btn-primary w-100"
              onClick={handleSendOtp}
              disabled={loading}
              style={{ backgroundColor: '#4A90D9', border: 'none' }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <>
              <div className="mb-3">
                <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>OTP</label>
                <input
                  type="text"
                  className="form-control"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6 digit OTP"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                onClick={handleVerifyOtp}
                disabled={loading}
                style={{ backgroundColor: '#4A90D9', border: 'none' }}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                className="btn btn-link w-100 mt-2"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                style={{ color: '#4A90D9' }}
              >
              </button>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#333333' }}>
          Don't have an account? <a href="/register" style={{ color: '#4A90D9' }}>Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
