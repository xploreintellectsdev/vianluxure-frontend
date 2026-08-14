"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Type, Sparkles } from 'lucide-react';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { heroApi } from '@/api/hero.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getHeroMarqueeColumns } from './hero.columns';
import { heroMarqueeFields, mapHeroMarqueeToFormData, buildHeroMarqueePayload } from './hero.fields';

const MarqueePreview = ({ formValues }) => {
  const [bgImage, setBgImage] = useState(null);
  
  useEffect(() => {
    // Fetch one active slide to use as the background for the preview
    heroApi.getAllSlides({ status: 1, limit: 1 }).then(res => {
      const slides = res?.data?.data || res?.data || [];
      if (slides.length > 0 && slides[0].image) {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        setBgImage(`${API_URL}${slides[0].image}`);
      }
    }).catch(() => {});
  }, []);

  const currentText = formValues?.item_text || "Your text will appear here...";
  const marqueeTrack = Array(12).fill(currentText);

  return (
    <div className="relative w-full flex flex-col bg-slate-900">
      {/* Mock Hero Slide to give context */}
      <div className="relative w-full h-[40vh] min-h-[18.75rem] flex items-center justify-center overflow-hidden">
        {bgImage ? (
          <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: `url(${bgImage})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900 opacity-80" />
        )}
        <div className="relative z-10 text-center px-6">
           <h2 className="text-white text-2xl sm:text-4xl font-bold opacity-80 uppercase tracking-widest drop-shadow-md">Hero Section</h2>
           <p className="text-stone-300 text-sm mt-2 opacity-80 drop-shadow-md">The marquee appears directly below.</p>
        </div>
      </div>

      {/* Marquee Strip */}
      <div className="relative w-full overflow-hidden bg-[#111111] py-3 md:py-4 border-y border-[#C8A64D]/20 shadow-2xl shrink-0">
        <div className="flex w-max animate-hero-marquee items-center whitespace-nowrap">
          {marqueeTrack.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 md:gap-2.5 mx-4 md:mx-6 text-white text-xs sm:text-sm md:text-base font-semibold tracking-wide"
            >
              <Sparkles size={14} className="shrink-0 text-amber-400 md:w-4 md:h-4" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function MarqueeTab() {
  const [viewMode, setViewMode] = useState('active');
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiFn = useCallback((params) =>
    viewMode === 'active'
      ? heroApi.getAllMarquee(params)
      : trashApi.getDeleted('hero_marquee', params),
  [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load marquee items.');

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback(async (row) => {
    try {
      const res = await heroApi.getMarqueeById(row.item_id);
      const itemData = res.data?.data || res.data || row;
      setDialog({ open: true, data: mapHeroMarqueeToFormData(itemData) });
    } catch {
      setDialog({ open: true, data: mapHeroMarqueeToFormData(row) });
    }
  }, []);

  const handleToggle = useCallback(async (row) => {
    try {
      const newStatus = row.is_active === 1 || row.is_active === true ? 0 : 1;
      const mapped = mapHeroMarqueeToFormData({ ...row, is_active: newStatus });
      const payload = buildHeroMarqueePayload(mapped);
      await heroApi.updateMarquee(row.item_id, payload);
      showToast.success(`Item marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchData();
    } catch {
      showToast.error('Failed to update status.');
    }
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const name = deleteTarget.item_text || `Item #${deleteTarget.item_id}`;
      await heroApi.deleteMarquee(deleteTarget.item_id);
      setDeleteTarget(null);
      fetchData();
      showToast.undo(`Moved "${name}" to trash.`, async () => {
        try {
          await trashApi.restore('hero_marquee', deleteTarget.item_id);
          showToast.success(`Restored "${name}".`);
          fetchData();
        } catch { showToast.error('Failed to restore.'); }
      });
    } catch {
      showToast.error('Failed to delete item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('hero_marquee', row.item_id);
      showToast.success(`Restored "${row.item_text}".`);
      fetchData();
    } catch {
      showToast.error('Failed to restore item.');
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getHeroMarqueeColumns({
    onEdit: handleEdit,
    onDelete: setDeleteTarget,
    onToggle: handleToggle,
    onRestore: handleRestore,
    isTrash: viewMode === 'trash',
  }), [handleEdit, handleToggle, viewMode]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Marquee Strip Items</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage the scrolling text strip below the hero section.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
          <div className="w-full sm:w-64 grow sm:grow-0">
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search text..." />
          </div>
          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <DataTable
          columns={columns} data={data} loading={loading}
          totalRows={totalRows} page={page} rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      <EntityDialog
        open={dialog.open} onClose={() => setDialog({ open: false, data: null })}
        onSuccess={handleSuccess} editData={dialog.data} fields={heroMarqueeFields}
        entityLabel="Marquee Item" icon={Type}
        apiCreate={heroApi.createMarquee}
        apiUpdate={heroApi.updateMarquee}
        getIdFromData={(row) => row.item_id}
        buildPayload={buildHeroMarqueePayload}
        renderPreview={(values) => <MarqueePreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.item_text}
        loading={deleteLoading} entityLabel="Marquee Item"
      />
    </div>
  );
}
