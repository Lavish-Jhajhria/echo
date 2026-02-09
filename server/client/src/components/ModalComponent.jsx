/**
 * Simple confirm modal with backdrop + ESC close.
 */

import React, { useEffect } from 'react';

/**
 * Confirmation modal.
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal body text
 * @param {Function} props.onCancel - Called on cancel/close
 * @param {Function} props.onConfirm - Called on confirm
 * @returns {JSX.Element | null}
 */
const ModalComponent = ({ isOpen, title, message, onCancel, onConfirm }) => {
  useEffect(() => {
    /**
     * Close on ESC key.
     * @param {KeyboardEvent} event - Key event
     * @returns {void}
     */
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  /**
   * Keep clicks inside modal from closing it.
   * @param {Object} event - Mouse event
   * @returns {void}
   */
  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="echo-card max-w-sm w-[92%] sm:w-full p-6 shadow-soft-lg animate-[fadeIn_0.18s_ease-out]"
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3
          id="modal-title"
          className="text-lg font-semibold text-white mb-2"
        >
          {title}
        </h3>
        <p className="text-sm text-slate-300 mb-5">{message}</p>

        <div className="flex justify-end gap-3 text-sm">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg bg-error text-white hover:bg-red-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;

