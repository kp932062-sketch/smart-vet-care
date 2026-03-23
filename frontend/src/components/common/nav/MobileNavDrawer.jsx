import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileNavDrawer = ({ isOpen, onClose, links = [], title = 'Menu' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true">
      <button
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu overlay"
      />

      <aside className="absolute right-0 top-0 flex h-full w-80 max-w-[90vw] flex-col border-l border-white/10 bg-slate-900/95 p-5 text-white shadow-2xl animate-slide-in-right">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/75">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                link.active ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default MobileNavDrawer;
