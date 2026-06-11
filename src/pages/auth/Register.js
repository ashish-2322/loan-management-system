import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.mobileNumber) {
      setError('All fields are required');
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      setError('Mobile number must be 10 digits');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.fullName, formData.email, formData.password, formData.mobileNumber);
      setSuccess('Registration successful! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('User already registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px', border: '1px solid #dee2e6', padding: '30px' }}>
        <h2 style={{ color: '#333333', textAlign: 'center', marginBottom: '30px' }}>Create Account</h2>
        
        {error && (
          <div className="alert alert-danger" style={{ backgroundColor: '#f8d7da', color: '#721c24', border: 'none' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ backgroundColor: '#d4edda', color: '#155724', border: 'none' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Full Name</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-3">
            <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <div className="mb-3">
            <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              className="form-control"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="Enter 10 digit mobile number"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ backgroundColor: '#4A90D9', border: 'none' }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#333333' }}>
          Already have an account? <a href="/login" style={{ color: '#4A90D9' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
