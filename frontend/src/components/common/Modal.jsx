import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({ isOpen, title, onClose, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-white/60 bg-white/95 shadow-[0_30px_90px_-32px_rgba(15,23,42,0.6)] dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-[0_30px_90px_-30px_rgba(2,6,23,0.9)] animate-slide-up`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-slate-700">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="px-2"
          >
            Close
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;