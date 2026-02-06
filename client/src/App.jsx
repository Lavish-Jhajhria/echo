/**
 * Root application layout for Echo Feedback Collector.
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

/**
 * Renders the main application shell.
 * @returns {JSX.Element} React component
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-full bg-gradient-to-b from-navy-900 via-navy-900 to-slate-950 text-slate-100">
              <HomePage />
            </div>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

