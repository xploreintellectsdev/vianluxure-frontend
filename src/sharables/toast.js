import React from 'react';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

const toastOptions = {
  success: {
    duration: 3500,
    iconTheme: { primary: '#22c55e', secondary: '#fff' },
    style: {
      borderRadius: '14px',
      fontWeight: '600',
      fontSize: '13px',
      padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      background: '#f0fdf4',
      color: '#15803d',
      border: '1px solid #bbf7d0',
    },
  },
  error: {
    duration: 4000,
    iconTheme: { primary: '#B22222', secondary: '#fff' },
    style: {
      borderRadius: '14px',
      fontWeight: '600',
      fontSize: '13px',
      padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      background: '#fff1f2',
      color: '#B22222',
      border: '1px solid #fecdd3',
    },
  },
  loading: {
    duration: Infinity,
    style: {
      borderRadius: '14px',
      fontWeight: '600',
      fontSize: '13px',
      padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      background: '#f8fafc',
      color: '#475569',
      border: '1px solid #e2e8f0',
    },
  },
};

const showToast = {
  success: (message) => toast.success(message, toastOptions.success),
  error:   (message) => toast.error(message,   toastOptions.error),
  loading: (message) => toast.loading(message, toastOptions.loading),
  dismiss: (id)      => toast.dismiss(id),
  warning: (message) => toast(message, {
    duration: 5000,
    icon: '⚠️',
    style: {
      borderRadius: '14px',
      fontWeight: '600',
      fontSize: '13px',
      padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
  }),
  undo: (message, onUndo) => toast((t) => (
    <div className="flex items-center gap-3">
      <span className="text-slate-800 font-semibold text-[13px]">{message}</span>
      <button
        onClick={() => {
          toast.dismiss(t.id);
          if (onUndo) onUndo();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Undo
      </button>
    </div>
  ), {
    duration: 8000,
    style: {
      borderRadius: '16px',
      padding: '12px 16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      background: '#fff',
      border: '2px solid #C8A64D',
    },
  }),
};

export default showToast;