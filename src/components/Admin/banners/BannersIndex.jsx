"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Image as ImageIcon, ArrowRight } from 'lucide-react';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { bannerApi } from '@/api/banner.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getBannersColumns } from './banners.columns';
import { bannersFields, mapBannerToFormData, buildBannerPayload } from './banners.fields';

const BannerPreview = ({ formValues }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  let imgUrl = null;
  if (formValues?.image instanceof File) {
    imgUrl = URL.createObjectURL(formValues.image);
  } else if (typeof formValues?.image === 'string' && formValues.image) {
    imgUrl = `${API_URL}${formValues.image}`;
  }

  const isSplit = formValues?.layout_type === 'split-stats';

  return (
    <div className="relative w-full h-[50vh] min-h-[25rem] overflow-hidden bg-[#1c1a17] group flex items-center justify-center">
      {imgUrl ? (
        <div className="absolute inset-0">
          <img src={imgUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
          <div className={`absolute inset-0 ${isSplit ? 'bg-gradient-to-t from-black/55 via-black/20 to-black/25' : 'bg-gradient-to-t from-black/55 via-black/10 to-black/25'}`} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c1a17] text-white/50 text-sm font-bold uppercase tracking-widest border border-dashed border-white/10 m-6">
          No Image Provided
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-center">
        {isSplit ? (
          <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 py-8 max-w-2xl">
            <h1 className="text-white text-4xl md:text-5xl font-serif font-semibold tracking-tight leading-[0.95] mb-6 drop-shadow-lg">
              {formValues?.title || 'Enter Title...'}
            </h1>
            {formValues?.description && (
              <p className="text-white/90 text-sm md:text-base font-mono max-w-xl mb-8 drop-shadow">
                {formValues.description}
              </p>
            )}
            {formValues?.stats && formValues.stats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 mb-8">
                {formValues.stats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-white text-2xl font-extrabold mb-1 drop-shadow">{stat.value || '0'}</p>
                    <p className="text-white/85 text-xs font-mono">{stat.title || 'Label'}</p>
                  </div>
                ))}
              </div>
            )}
            {formValues?.button_text && (
              <div className="flex items-center justify-center gap-3 w-fit py-3 px-6 bg-white/95 border-2 border-white text-black font-mono text-sm tracking-wide">
                {formValues.button_text} <ArrowRight size={16} />
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
            {formValues?.eyebrow_label && (
              <span className="text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
                {formValues.eyebrow_label}
              </span>
            )}
            <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-serif font-semibold leading-[0.95] max-w-2xl">
              {formValues?.title || 'Enter Title...'}
            </h2>
            {formValues?.button_text && (
              <div className="mt-8 flex items-center gap-2 w-fit">
                <span className="text-white text-sm md:text-base font-semibold tracking-[0.15em] uppercase border-b border-white/70 pb-1">
                  {formValues.button_text}
                </span>
                <ArrowRight strokeWidth={2.5} size={18} className="text-white" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function BannersIndex() {
  const [viewMode, setViewMode] = useState('active');
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiFn = useCallback((params) =>
    viewMode === 'active'
      ? bannerApi.getAllBanners(params)
      : trashApi.getDeleted('banners', params),
  [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load banners.');

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback(async (row) => {
    try {
      const res = await bannerApi.getBannerById(row.banner_id);
      const itemData = res.data?.data || res.data || row;
      setDialog({ open: true, data: mapBannerToFormData(itemData) });
    } catch {
      setDialog({ open: true, data: mapBannerToFormData(row) });
    }
  }, []);

  const handleToggle = useCallback(async (row) => {
    try {
      const newStatus = row.is_active === 1 || row.is_active === true ? 0 : 1;
      const mapped = mapBannerToFormData({ ...row, is_active: newStatus });
      const fd = buildBannerPayload(mapped);
      await bannerApi.updateBanner(row.banner_id, fd);
      showToast.success(`Banner marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchData();
    } catch {
      showToast.error('Failed to update status.');
    }
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const name = deleteTarget.title || deleteTarget.banner_key;
      await bannerApi.deleteBanner(deleteTarget.banner_id);
      setDeleteTarget(null);
      fetchData();
      showToast.undo(`Moved "${name}" to trash.`, async () => {
        try {
          await trashApi.restore('banners', deleteTarget.banner_id);
          showToast.success(`Restored "${name}".`);
          fetchData();
        } catch { showToast.error('Failed to restore.'); }
      });
    } catch {
      showToast.error('Failed to delete banner.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('banners', row.banner_id);
      showToast.success(`Restored "${row.title || row.banner_key}".`);
      fetchData();
    } catch {
      showToast.error('Failed to restore banner.');
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getBannersColumns({
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
          <h2 className="text-xl font-bold text-slate-800">Home Banners</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage promotional banners for the home page.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
          <div className="w-full sm:w-64 grow sm:grow-0">
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search banners..." />
          </div>
          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Banner</span>
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
        onSuccess={handleSuccess} editData={dialog.data} fields={bannersFields}
        entityLabel="Banner" icon={ImageIcon}
        apiCreate={bannerApi.createBanner}
        apiUpdate={bannerApi.updateBanner}
        getIdFromData={(row) => row.banner_id}
        buildPayload={buildBannerPayload}
        renderPreview={(values) => <BannerPreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.title || deleteTarget?.banner_key}
        loading={deleteLoading} entityLabel="Banner"
      />
    </div>
  );
}
