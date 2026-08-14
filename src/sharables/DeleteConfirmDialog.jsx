import React from 'react';
import { Dialog, DialogContent, IconButton, Fade } from '@mui/material';
import { Trash2, X, Loader2, AlertCircle } from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemName, loading, entityLabel = 'Record' }) => {
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            padding: 0,
            width: '100%',
            maxWidth: '420px',
            margin: { xs: '16px', sm: '32px' },
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
            bgcolor: '#FDFBF7',
            border: '1px solid rgba(200, 166, 77, 0.2)',
          }
        },
        backdrop: { timeout: 400, sx: { bgcolor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)' } },
      }}
    >
      <DialogContent style={{ padding: 0 }}>
        <div className="flex flex-col">
          <div className="flex justify-end px-5 pt-5">
            <IconButton onClick={onClose} size="small" disabled={loading} sx={{ bgcolor: '#FAF6F0', '&:hover': { bgcolor: '#F0ECE4' } }}>
              <X size={16} className="text-slate-500" />
            </IconButton>
          </div>

          <div className="flex flex-col items-center text-center px-6 sm:px-8 pb-6 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
              <AlertCircle size={32} strokeWidth={1.8} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">Move {entityLabel} to Trash?</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-900">"{itemName}"</span>?
                <br /><span className="text-xs text-[#8C7A4E] block mt-1.5 bg-[#F5F0E4] p-2 rounded-lg border border-[#E8DFCA]">This item will be safely stored in your Trash bin where it can be restored anytime.</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 px-6 sm:px-8 pb-7">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-slate-700 hover:bg-stone-50 transition-all active:scale-[0.99]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {loading ? 'Moving...' : 'Move to Trash'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;