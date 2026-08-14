"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { storySectionApi } from '@/api/storySection.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getStorySectionsColumns } from './storySections.columns';
import { storySectionFields, mapStorySectionToFormData, buildStorySectionPayload } from './storySections.fields';
import CardsManager from './CardsManager';

const StorySectionPreview = ({ formValues }) => {
  return (
    <section className="w-full h-full min-h-[28.125rem] bg-[#FDFBF7] py-8 md:py-12 overflow-hidden flex items-center border-y border-[#EAE3D2] shadow-inner">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Intro / Title Block */}
        <div className="flex-shrink-0 w-full sm:w-52 md:w-72 flex flex-col justify-center">
          {formValues?.eyebrow_label && (
            <span className="text-xs font-bold text-[#8C7A4E] tracking-[0.2em] uppercase mb-3">
              {formValues.eyebrow_label}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 font-serif font-bold leading-tight mb-4">
            {formValues?.title || 'Section Title'}
          </h2>
          {formValues?.description && (
            <p className="text-sm text-stone-600 leading-relaxed">
              {formValues.description}
            </p>
          )}
        </div>

        {/* Placeholder for Cards to show context */}
        <div className="relative flex-1 min-w-0 opacity-60">
          <div className="flex gap-4 sm:gap-5 md:gap-7 overflow-hidden w-full max-w-full">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-[72vw] sm:w-64 md:w-80 flex flex-col">
                <div className="w-full aspect-[4/3] mb-3 sm:mb-4 relative overflow-hidden rounded-2xl bg-stone-200 flex items-center justify-center">
                  <span className="text-stone-400 font-bold tracking-widest uppercase text-xs">Card Image</span>
                </div>
                <p className="italic text-center text-stone-500 text-[0.8125rem] sm:text-[0.875rem] leading-snug mb-3 sm:mb-4 min-h-[2.25rem] sm:min-h-[2.625rem]">
                  Caption...
                </p>
                <span className="text-lg sm:text-xl font-extrabold text-[#C8A64D] mb-1.5 block">
                  0{i}
                </span>
                <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-snug mb-2 sm:mb-2.5">
                  Card Title
                </h3>
                <p className="text-sm text-stone-500">Description preview...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function StorySectionsIndex() {
  const [viewMode, setViewMode] = useState('active');
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [managingSection, setManagingSection] = useState(null);

  const apiFn = useCallback((params) =>
    viewMode === 'active'
      ? storySectionApi.getAllSections(params)
      : trashApi.getDeleted('story_sections', params),
  [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load story sections.');

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback(async (row) => {
    try {
      const res = await storySectionApi.getSectionById(row.section_id);
      const itemData = res.data?.data || res.data || row;
      setDialog({ open: true, data: mapStorySectionToFormData(itemData) });
    } catch {
      setDialog({ open: true, data: mapStorySectionToFormData(row) });
    }
  }, []);

  const handleToggle = useCallback(async (row) => {
    try {
      const newStatus = row.is_active === 1 || row.is_active === true ? 0 : 1;
      const mapped = mapStorySectionToFormData({ ...row, is_active: newStatus });
      const payload = buildStorySectionPayload(mapped);
      await storySectionApi.updateSection(row.section_id, payload);
      showToast.success(`Section marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchData();
    } catch {
      showToast.error('Failed to update status.');
    }
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const name = deleteTarget.title || `Section #${deleteTarget.section_id}`;
      await storySectionApi.deleteSection(deleteTarget.section_id);
      setDeleteTarget(null);
      fetchData();
      showToast.undo(`Moved "${name}" to trash.`, async () => {
        try {
          await trashApi.restore('story_sections', deleteTarget.section_id);
          showToast.success(`Restored "${name}".`);
          fetchData();
        } catch { showToast.error('Failed to restore.'); }
      });
    } catch {
      showToast.error('Failed to delete section.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('story_sections', row.section_id);
      showToast.success(`Restored "${row.title}".`);
      fetchData();
    } catch {
      showToast.error('Failed to restore section.');
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const handleManageCards = useCallback((section) => setManagingSection(section), []);

  const columns = useMemo(() => getStorySectionsColumns({
    onEdit: handleEdit,
    onDelete: setDeleteTarget,
    onManageCards: handleManageCards,
    onToggle: handleToggle,
    onRestore: handleRestore,
    isTrash: viewMode === 'trash',
  }), [handleEdit, handleManageCards, handleToggle, viewMode]);

  if (managingSection) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <CardsManager
          sectionId={managingSection.section_id}
          sectionTitle={managingSection.title}
          onBack={() => setManagingSection(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Story Sections</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage dynamic story carousels across the site.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
          <div className="w-full sm:w-64 grow sm:grow-0">
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search sections..." />
          </div>
          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Section</span>
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
        open={dialog.open}
        onClose={() => setDialog({ open: false, data: null })}
        entityLabel="Story Section"
        fields={storySectionFields}
        editData={dialog.data}
        apiCreate={storySectionApi.createSection}
        apiUpdate={storySectionApi.updateSection}
        getIdFromData={(data) => data.section_id}
        buildPayload={buildStorySectionPayload}
        onSuccess={handleSuccess}
        renderPreview={(values) => <StorySectionPreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget?.title}
        entityLabel="Story Section"
      />
    </div>
  );
}
