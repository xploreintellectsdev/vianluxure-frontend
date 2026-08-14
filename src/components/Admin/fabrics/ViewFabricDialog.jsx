"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { X, Loader2 } from 'lucide-react';
import { fabricApi } from '@/api/fabric.api';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const ViewFabricDialog = ({ open, onClose, fabId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && fabId) {
      setLoading(true);
      fabricApi.getById(fabId)
        .then(res => setData(res.data))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [open, fabId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '20px', maxHeight: '88vh' } } }}>
      <DialogTitle sx={{ bgcolor: '#FDFCFB', borderBottom: '1px solid #EDE9E3', py: 2.5 }}>
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-stone-900">{data?.fab_name || 'Fabric Details'}</span>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </div>
      </DialogTitle>

      <DialogContent sx={{ py: 3, bgcolor: '#FDFCFB' }}>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-stone-400" /></div>
        ) : !data ? null : (
          <div className="space-y-6">
            {/* Cover + Gallery Images */}
            <div>
              <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-2">Images</p>
              <div className="flex flex-wrap gap-2">
                {data.fab_cover_image && (
                  <img src={`${API_URL}${data.fab_cover_image}`} className="w-20 h-20 rounded-xl object-cover border-2 border-[#A67C3D]" alt="cover" />
                )}
                {data.images?.map(img => (
                  <img key={img.img_id} src={`${API_URL}${img.img_url}`} className="w-20 h-20 rounded-xl object-cover border border-stone-200" alt="gallery" />
                ))}
              </div>
            </div>

            {/* Classification */}
            <div>
              <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-2">Classification</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-stone-400">Category:</span> <span className="font-semibold">{data.fc_name || '-'}</span></div>
                <div><span className="text-stone-400">Color:</span> <span className="font-semibold">{data.col_name || '-'}</span></div>
                <div><span className="text-stone-400">Origin:</span> <span className="font-semibold">{data.org_name || '-'}</span></div>
                <div><span className="text-stone-400">Weight:</span> <span className="font-semibold">{data.wt_name || '-'}</span></div>
                <div><span className="text-stone-400">Weave:</span> <span className="font-semibold">{data.wv_name || '-'}</span></div>
                <div><span className="text-stone-400">Pattern:</span> <span className="font-semibold">{data.pat_name || '-'}</span></div>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-2">Specifications</p>
              <div className="space-y-1.5">
                {data.specifications?.length ? data.specifications.map(spec => (
                  <div key={spec.spec_id} className="flex justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                    <span className="text-stone-500 font-medium">{spec.spec_title}</span>
                    <span className="font-semibold text-stone-800">{spec.spec_value}</span>
                  </div>
                )) : <p className="text-xs text-stone-400">No specifications added.</p>}
              </div>
            </div>

            {/* Styles */}
            {data.styles?.length > 0 && (
              <div>
                <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-2">Styles</p>
                <div className="flex flex-wrap gap-2">
                  {data.styles.map(s => (
                    <span key={s.sty_id} className="text-xs font-bold bg-[#A67C3D]/10 text-[#A67C3D] px-3 py-1 rounded-full">{s.sty_name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewFabricDialog;