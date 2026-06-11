import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import PrivateRoute from './utils/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/customer/Dashboard';
import PersonalLoan from './pages/customer/PersonalLoan';
import VehicleLoan from './pages/customer/VehicleLoan';
import HomeLoan from './pages/customer/HomeLoan';
import MyLoans from './pages/customer/MyLoans';
import UploadDocument from './pages/customer/UploadDocument';
import Notifications from './pages/customer/Notifications';
import KycUploadPage from './pages/customer/KycUploadPage';
import OfficerDashboard from './pages/officer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/customer/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/apply/personal"
          element={
            <PrivateRoute>
              <PersonalLoan />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/apply/vehicle"
          element={
            <PrivateRoute>
              <VehicleLoan />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/apply/home"
          element={
            <PrivateRoute>
              <HomeLoan />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/kyc"
          element={
            <PrivateRoute>
              <KycUploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/my-loans"
          element={
            <PrivateRoute>
              <MyLoans />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/upload-document"
          element={
            <PrivateRoute>
              <UploadDocument />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/officer/dashboard"
          element={
            <PrivateRoute>
              <OfficerDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <ManageUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
