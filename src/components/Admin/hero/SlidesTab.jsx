"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { heroApi } from '@/api/hero.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getHeroSlidesColumns } from './hero.columns';
import { heroSlidesFields, mapHeroSlideToFormData, buildHeroSlidePayload } from './hero.fields';

const HeroSlidePreview = ({ formValues }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  let imgUrl = null;
  if (formValues?.image instanceof File) {
    imgUrl = URL.createObjectURL(formValues.image);
  } else if (typeof formValues?.image === 'string' && formValues.image) {
    imgUrl = `${API_URL}${formValues.image}`;
  }

  return (
    <div className="relative w-full h-[60vh] min-h-[25rem] bg-slate-900 overflow-hidden flex items-center justify-center">
      {imgUrl ? (
        <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${imgUrl})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900 text-stone-600 font-bold uppercase tracking-widest text-sm">No Image Provided</div>
      )}
      
      <div className="relative z-20 w-full h-full">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full px-10 lg:px-20 z-20">
          <h1 className="text-[2rem] md:text-5xl lg:text-6xl text-white font-bold whitespace-pre-line text-left max-w-3xl leading-[1.2]">
            {formValues?.title || 'Enter Slide Title...'}
          </h1>
        </div>

        <div className="absolute bottom-10 left-0 w-full px-10 lg:px-20 z-30 flex items-end justify-between">
          <div className="flex justify-start w-full max-w-sm">
            {formValues?.description && (
              <div className="relative z-40 w-full bg-black/75 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4 shadow-2xl">
                <p className="text-white text-sm font-medium leading-relaxed text-left drop-shadow-md">
                  {formValues.description}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end w-full">
            {formValues?.button_link && (
              <div className="inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white font-bold cursor-default shadow-md hover:shadow-lg transition-all">
                {formValues?.button_text || "Shop Now"}
                <ArrowUpRight size={20} className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SlidesTab() {
  const [viewMode, setViewMode] = useState('active');
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiFn = useCallback((params) =>
    viewMode === 'active'
      ? heroApi.getAllSlides(params)
      : trashApi.getDeleted('hero_slides', params),
  [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load slides.');

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback(async (row) => {
    try {
      const res = await heroApi.getSlideById(row.slide_id);
      const itemData = res.data?.data || res.data || row;
      setDialog({ open: true, data: mapHeroSlideToFormData(itemData) });
    } catch (error) {
      setDialog({ open: true, data: mapHeroSlideToFormData(row) });
    }
  }, []);

  const handleToggle = useCallback(async (row) => {
    try {
      const newStatus = row.is_active === 1 || row.is_active === true ? 0 : 1;
      const mapped = mapHeroSlideToFormData({ ...row, is_active: newStatus });
      const fd = buildHeroSlidePayload(mapped);
      await heroApi.updateSlide(row.slide_id, fd);
      showToast.success(`Slide marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchData();
    } catch {
      showToast.error('Failed to update status.');
    }
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const name = deleteTarget.title || `Slide #${deleteTarget.slide_id}`;
      await heroApi.deleteSlide(deleteTarget.slide_id);
      setDeleteTarget(null);
      fetchData();
      showToast.undo(`Moved "${name}" to trash.`, async () => {
        try {
          await trashApi.restore('hero_slides', deleteTarget.slide_id);
          showToast.success(`Restored "${name}".`);
          fetchData();
        } catch { showToast.error('Failed to restore.'); }
      });
    } catch {
      showToast.error('Failed to delete slide.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('hero_slides', row.slide_id);
      showToast.success(`Restored "${row.title}".`);
      fetchData();
    } catch {
      showToast.error('Failed to restore slide.');
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getHeroSlidesColumns({
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
          <h2 className="text-xl font-bold text-slate-800">Hero Slides</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage the image slides in the home page hero section.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
          <div className="w-full sm:w-64 grow sm:grow-0">
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search slides..." />
          </div>
          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Slide</span>
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
        onSuccess={handleSuccess} editData={dialog.data} fields={heroSlidesFields}
        entityLabel="Hero Slide" icon={ImageIcon}
        apiCreate={heroApi.createSlide}
        apiUpdate={heroApi.updateSlide}
        getIdFromData={(row) => row.slide_id}
        buildPayload={buildHeroSlidePayload}
        renderPreview={(values) => <HeroSlidePreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.title}
        loading={deleteLoading} entityLabel="Slide"
      />
    </div>
  );
}
