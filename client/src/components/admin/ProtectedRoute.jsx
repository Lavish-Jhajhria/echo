/**
 * Protect admin routes - redirect to home if not authenticated as admin.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * ProtectedRoute wrapper.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children }) => {
  if (!authService.isAdminAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

