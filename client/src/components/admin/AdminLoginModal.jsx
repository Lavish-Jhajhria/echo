/**
 * Password prompt for admin access.
 */

import React, { useEffect, useRef, useState } from 'react';
import { setAdminAuthenticated } from '../../utils/adminAuth';

const ADMIN_PASSWORD = 'admin@lavish';

/**
 * AdminLoginModal.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSuccess
 * @returns {JSX.Element|null}
 */
const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setPassword('');
    setError('');
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Enter') handleSubmit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, password]);

  const handleSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      onSuccess?.();
      return;
    }
    setError('Incorrect password');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close admin login"
        className="absolute inset-0 bg-slate-950/70"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/70 bg-navy-800/90 backdrop-blur p-6 shadow-soft-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Admin access</h3>
          <p className="text-xs text-slate-400">Enter the admin password to continue.</p>
        </div>

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="echo-input"
            placeholder="Password"
          />
          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm hover:from-primary-600 hover:to-accent-500"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;

