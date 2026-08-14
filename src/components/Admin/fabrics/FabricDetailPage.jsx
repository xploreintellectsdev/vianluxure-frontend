"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fabricApi } from '@/api/fabric.api';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// ── NEW: dedicated URL (/admin/fabrics/[id]) so a fabric's specifications
// and images can be opened/shared/bookmarked as their own page, separate
// from the quick-look modal (ViewFabricDialog) opened via the "Eye" icon.
const FabricDetailPage = ({ fabId }) => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fabId) return;
    setLoading(true);
    fabricApi.getById(fabId)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load fabric details.'))
      .finally(() => setLoading(false));
  }, [fabId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-stone-400" size={28} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-sm font-semibold text-red-500">{error || 'Fabric not found.'}</p>
        <button onClick={() => router.push('/admin/fabrics')} className="mt-4 text-sm font-bold text-[#A67C3D]">
          &larr; Back to Fabric Master
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button onClick={() => router.push('/admin/fabrics')} className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
        <ArrowLeft size={16} /> Back to Fabric Master
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{data.fab_name}</h1>
          <p className="text-sm text-slate-500 font-medium flex flex-wrap items-center gap-2 mt-1">
            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{data.fab_group_code}</span>
            <span className="font-bold text-slate-900">₹{data.fab_price_per_meter} / meter (GST Included)</span>
            {data.fab_stitching_charges !== undefined && data.fab_stitching_charges !== null && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Stitching Cost: ₹{data.fab_stitching_charges}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-3">Images</p>
        <div className="flex flex-wrap gap-3">
          {data.fab_cover_image && (
            <img src={`${API_URL}${data.fab_cover_image}`} className="w-32 h-32 rounded-2xl object-cover border-2 border-[#A67C3D]" alt="cover" />
          )}
          {data.images?.map(img => (
            <img key={img.img_id} src={`${API_URL}${img.img_url}`} className="w-32 h-32 rounded-2xl object-cover border border-stone-200" alt="gallery" />
          ))}
          {!data.fab_cover_image && !data.images?.length && (
            <p className="text-xs text-stone-400">No images uploaded.</p>
          )}
        </div>
      </div>

      {/* Classification */}
      <div>
        <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-3">Classification</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm bg-white border border-stone-100 rounded-2xl p-4">
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
        <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-3">Specifications</p>
        <div className="space-y-1.5">
          {data.specifications?.length ? data.specifications.map(spec => (
            <div key={spec.spec_id} className="flex justify-between text-sm bg-stone-50 rounded-lg px-4 py-2.5">
              <span className="text-stone-500 font-medium">{spec.spec_title}</span>
              <span className="font-semibold text-stone-800">{spec.spec_value}</span>
            </div>
          )) : <p className="text-xs text-stone-400">No specifications added.</p>}
        </div>
      </div>

      {/* Styles */}
      {data.styles?.length > 0 && (
        <div>
          <p className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-3">Styles</p>
          <div className="flex flex-wrap gap-2">
            {data.styles.map(s => (
              <span key={s.sty_id} className="text-xs font-bold bg-[#A67C3D]/10 text-[#A67C3D] px-3 py-1.5 rounded-full">{s.sty_name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Visibility flags */}
      <div className="flex gap-2">
        {!!data.is_new_arrival && <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">New Arrival</span>}
        {!!data.is_best_seller && <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full">Best Seller</span>}
      </div>
    </div>
  );
};

export default FabricDetailPage;
