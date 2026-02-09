/**
 * Top admin header with search + profile/logout.
 */

import React, { useState } from 'react';
import { LogOut, Search, User } from 'lucide-react';
import { clearAdminAuth } from '../../utils/adminAuth';

/**
 * AdminHeader.
 * @param {Object} props
 * @param {string} props.searchValue
 * @param {Function} props.onSearchChange
 * @param {Function} props.onLogout
 * @returns {JSX.Element}
 */
const AdminHeader = ({ searchValue, onSearchChange, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAdminAuth();
    onLogout?.();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search feedback…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          aria-label="Admin profile menu"
        >
          <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </span>
          <span className="hidden sm:inline font-medium">Admin</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;

