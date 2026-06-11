import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (!config.headers) {
      config.headers = {};
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('api request', config.method, config.url, 'Authorization=', config.headers.Authorization);
    } else {
      console.warn('api request without token', config.method, config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = (fullName, email, password, mobileNumber) => {
  return api.post('/api/auth/register', { fullName, email, password, mobileNumber });
};

export const sendOtp = (mobileNumber) => {
  return api.post('/api/auth/send-otp', { mobileNumber });
};

export const verifyOtp = (mobileNumber, otp) => {
  return api.post('/api/auth/verify-otp', { mobileNumber, otp });
};

export const applyLoan = (loanType, data) => {
  return api.post(`/api/customer/apply/${loanType}`, data);
};

export const applyLoanWithDocument = (loanType, data, documentType, file) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'file' || key === 'documentType') {
      return;
    }
    if (value !== undefined && value !== null) {
      const fieldName = key === 'loanTerm' ? 'loanTermMonths' : key;
      formData.append(fieldName, value);
    }
  });
  formData.append('documentType', documentType);
  formData.append('file', file);
  console.debug('applyLoanWithDocument payload fields:', Array.from(formData.entries()));
  return api.post(`/api/customer/apply/${loanType}`, formData);
};

export const getMyLoans = () => {
  return api.get('/api/customer/my-loans');
};

export const getCustomerProfile = () => {
  return api.get('/api/customer/profile');
};

export const uploadDocument = (loanId, documentType, file) => {
  const formData = new FormData();
  formData.append('loanId', loanId);
  formData.append('documentType', documentType);
  formData.append('file', file);
  return api.post('/api/customer/upload-document', formData);
};

export const uploadDocumentPreApplication = (documentType, file) => {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);
  return api.post('/api/customer/upload-document-pre-application', formData);
};

export const getMyDocuments = () => {
  return api.get('/api/customer/my-documents');
};

export const hasDocumentsUploaded = async () => {
  try {
    const response = await getMyDocuments();
    return response.data && response.data.length > 0;
  } catch (error) {
    return false;
  }
};

export const getNotifications = () => {
  return api.get('/api/customer/notifications');
};

export const markNotificationsRead = () => {
  return api.put('/api/customer/notifications/read');
};

export const getPendingLoans = () => {
  return api.get('/api/officer/pending-loans');
};

export const getOfficerLoansByStatus = (status) => {
  return api.get('/api/officer/loans', { params: { status } });
};

export const getOfficerLoanCounts = () => {
  return api.get('/api/officer/loan-counts');
};

export const getOfficerAllLoans = () => {
  return api.get('/api/officer/all-loans');
};

export const getLoanDocuments = (loanId) => {
  return api.get(`/api/officer/loan-documents/${loanId}`);
};

export const getCustomerLoanDocuments = (loanId) => {
  return api.get(`/api/customer/loan-documents/${loanId}`);
};

export const downloadDocument = (documentId, inline = false) => {
  return api.get(`/api/officer/loan-documents/download/${documentId}`, {
    responseType: 'blob',
    params: { inline },
  });
};

export const downloadCustomerLoanDocument = (documentId, inline = false) => {
  return api.get(`/api/customer/loan-documents/download/${documentId}`, {
    responseType: 'blob',
    params: { inline },
  });
};

export const reviewLoan = (loanId, status, comment) => {
  return api.put(`/api/officer/review/${loanId}`, { status, comment });
};

export const getAllUsers = () => {
  return api.get('/api/admin/users');
};

export const deleteUser = (id) => {
  return api.delete(`/api/admin/users/${id}`);
};

export const getAllLoans = () => {
  return api.get('/api/admin/all-loans');
};

export const getReport = () => {
  return api.get('/api/admin/report');
};

export const uploadKyc = (aadhaarFile, panFile) => {
  const formData = new FormData();
  formData.append('aadhaarFile', aadhaarFile);
  formData.append('panFile', panFile);
  return api.post('/api/kyc/upload', formData);
};

export const getMyKyc = () => {
  return api.get('/api/kyc/me');
};

export const downloadKycAadhaar = (inline = false) => {
  return api.get('/api/kyc/aadhaar', { responseType: 'blob', params: { inline } });
};

export const downloadKycPan = (inline = false) => {
  return api.get('/api/kyc/pan', { responseType: 'blob', params: { inline } });
};

export const getOfficerCustomerKyc = (userId) => {
  return api.get(`/api/officer/customer/${userId}/kyc`);
};

export const downloadOfficerKycAadhaar = (userId, inline = false) => {
  return api.get(`/api/officer/customer/${userId}/kyc/aadhaar`, {
    responseType: 'blob',
    params: { inline },
  });
};

export const downloadOfficerKycPan = (userId, inline = false) => {
  return api.get(`/api/officer/customer/${userId}/kyc/pan`, {
    responseType: 'blob',
    params: { inline },
  });
};

export default api;
