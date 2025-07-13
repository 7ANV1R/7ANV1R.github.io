import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Snackbar = ({ open, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed left-1/2 bottom-10 z-[9999] px-6 py-4 rounded-xl shadow-2xl border text-base font-semibold transition-all duration-300 animate-snackbar"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        borderColor: 'var(--accent)',
        transform: 'translateX(-50%)',
        minWidth: 220,
        maxWidth: 360,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
      role="alert"
      tabIndex={-1}
      onClick={onClose}
    >
      {message}
    </div>,
    document.body,
  );
};

export default Snackbar;
