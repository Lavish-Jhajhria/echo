/**
 * Admin dashboard container + routing.
 */

import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import OverviewPage from './OverviewPage';
import FeedbackManagementPage from './FeedbackManagementPage';
import UsersPage from './UsersPage';
import ReportsPage from './ReportsPage';
import AuditLogPage from './AuditLogPage';
import authService from '../../services/authService';

/**
 * AdminDashboard.
 * @returns {JSX.Element}
 */
const AdminDashboard = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/', { replace: true });
  };

  return (
    <AdminLayout searchValue={globalSearch} onSearchChange={setGlobalSearch} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/feedback" element={<FeedbackManagementPage globalSearch={globalSearch} />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/audit" element={<AuditLogPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;

