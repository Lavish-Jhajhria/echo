/**
 * Main admin layout (sidebar + header).
 */

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

/**
 * AdminLayout.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.searchValue
 * @param {Function} props.onSearchChange
 * @param {Function} props.onLogout
 * @returns {JSX.Element}
 */
const AdminLayout = ({ children, searchValue, onSearchChange, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

