"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { aboutApi } from '@/api/about.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getAboutSectionsColumns } from './aboutSections.columns';
import { aboutSectionsFields, mapAboutSectionToFormData, buildAboutSectionPayload } from './aboutSections.fields';
import ItemsManager from './ItemsManager';
import GalleryManager from './GalleryManager';

const AboutSectionPreview = ({ formValues }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  let imgUrl = null;
  if (formValues?.image instanceof File) {
    imgUrl = URL.createObjectURL(formValues.image);
  } else if (typeof formValues?.image === 'string' && formValues.image) {
    imgUrl = `${API_URL}${formValues.image}`;
  }

  const type = formValues?.section_type || 'hero';

  if (type === 'hero') {
    return (
      <section className="relative w-full h-[50vh] min-h-[26.25rem]">
        {/* Background Image */}
        {imgUrl ? (
           <img
            src={imgUrl}
            alt={formValues?.title || "Hero Image"}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-stone-300 flex items-center justify-center text-stone-500 font-bold tracking-widest uppercase text-sm">
             Upload Hero Image
          </div>
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Hero Text */}
        <div className="relative z-20 flex flex-col justify-end items-start h-full w-full pl-3 md:pl-8 pr-6 pb-10">
          <div className="max-w-xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-4 whitespace-pre-line">
              {formValues?.title || 'Hero Title'}
            </h1>
            <p className="text-sm md:text-base font-normal opacity-90 leading-relaxed whitespace-pre-line">
              {formValues?.description || 'Hero description goes here...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (type === 'richtext') {
    return (
      <section className="w-full bg-[#eeeeee] py-16 px-4 md:px-6 h-full flex flex-col items-center justify-center">
        <div className="max-w-7xl w-full">
          {formValues?.eyebrow_label && (
            <h2 className="text-slate-500 tracking-wide text-xl font-semibold mb-5">
              {formValues.eyebrow_label}
            </h2>
          )}
          <p className="text-slate-700 text-xl leading-loose whitespace-pre-line">
           {formValues?.description || 'Add your rich text description here...'}
          </p>
        </div>
      </section>
    );
  }

  if (type === 'split_image') {
    const bullets = Array.isArray(formValues?.bullet_points) ? formValues.bullet_points : [];
    return (
      <section className="w-full bg-white py-8 px-4 md:px-8 h-full flex items-center justify-center overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full">
          <div className="relative h-[17.5rem] md:h-[21.25rem] w-full overflow-hidden rounded-3xl bg-stone-100">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={formValues?.title || "Split Image"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-bold tracking-widest uppercase text-xs">Image</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 uppercase">
              {formValues?.title || 'Split Section Title'}
            </h2>
            <p className="text-slate-500 text-[0.9375rem] mb-4 leading-relaxed whitespace-pre-line">
              {formValues?.description?.trim() || 'Description goes here...'}
            </p>
            {bullets.length > 0 && (
              <>
                {formValues?.button_text && <h3 className="font-semibold text-slate-900 mb-2">{formValues.button_text}</h3>}
                <ul className="list-disc list-inside text-slate-500 text-[0.9375rem] space-y-1.5">
                  {bullets.map((b, i) => (
                    <li key={i}>
                      {typeof b === 'object' && b !== null ? (
                        <>
                           {b.title && <span className="font-semibold text-slate-900 mr-1">{b.title}</span>}
                           {b.value}
                        </>
                      ) : b}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === 'process') {
    const steps = Array.isArray(formValues?.process_steps) ? formValues.process_steps : [];
    return (
      <section className="py-6 px-4 md:px-10 lg:px-16 w-full h-full overflow-y-auto bg-stone-50">
        <div className="text-center mb-5 mt-4">
          <span className="text-slate-500 font-medium text-sm">{formValues?.eyebrow_label || 'Eyebrow'}</span>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
            {formValues?.title || 'Process Title'}
          </h3>
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden grid xl:grid-cols-2 w-full">
          {/* Left: yellow illustration panel */}
          <div className="bg-[#e9c069] flex items-center justify-center p-6 md:p-8">
            <div className="relative w-full aspect-square max-h-[30rem] bg-[#dca843] rounded-2xl overflow-hidden shadow-inner">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={formValues?.title || "Process Image"}
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#936b1a] font-bold tracking-widest uppercase text-xs">Image Illustration</div>
              )}
            </div>
          </div>

          {/* Right: details */}
          <div className="p-6 md:p-12 flex flex-col justify-center">
            <p className="text-slate-700 mb-5 leading-relaxed text-[1.0625rem] md:text-lg whitespace-pre-line">
              {formValues?.description || 'Description here...'}
            </p>

            {/* How It Works */}
            {steps.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <h4 className="text-lg md:text-xl font-semibold text-slate-900 whitespace-nowrap">
                    {formValues?.button_text || 'How It Works'}
                  </h4>
                  <div className="h-px w-full bg-slate-200" />
                </div>

                <div className="space-y-4 mb-6">
                  {steps.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-base">{item.title}</p>
                        <p className="text-sm md:text-[0.9375rem] text-slate-600 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === 'gallery') {
    const images = Array.isArray(formValues?.items) ? formValues.items : [];
    
    return (
      <section className="w-full bg-white py-16 h-full flex items-center overflow-hidden">
        <div className="relative w-full overflow-hidden py-4">
          {images.length > 0 ? (
            <div className="flex w-max animate-marquee gap-6">
              {images.map((item, idx) => (
                <div
                  key={idx}
                  className="relative h-[25rem] w-64 flex-shrink-0 overflow-hidden rounded-3xl bg-neutral-100 flex items-center justify-center border border-stone-200 shadow-sm"
                >
                  <img
                    src={item.item_image ? `${API_URL}${item.item_image}` : ''}
                    alt={`Gallery ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex w-max animate-marquee gap-6 opacity-60">
              {[1, 2, 3, 4].map((item, idx) => (
                <div
                  key={idx}
                  className="relative h-[25rem] w-64 flex-shrink-0 overflow-hidden rounded-3xl bg-neutral-100 flex items-center justify-center border-2 border-dashed border-stone-300"
                >
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Gallery Image</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
};

export default function AboutPageIndex() {
  const [viewMode, setViewMode] = useState('active');
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [managingItems, setManagingItems] = useState(null);
  const [managingGallery, setManagingGallery] = useState(null);

  const apiFn = useCallback((params) =>
    viewMode === 'active'
      ? aboutApi.getSections(params)
      : trashApi.getDeleted('about_sections', params),
  [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load about page sections.');

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback(async (row) => {
    try {
      const res = await aboutApi.getSectionById(row.section_id);
      const itemData = res.data?.data || res.data || row;
      setDialog({ open: true, data: mapAboutSectionToFormData(itemData) });
    } catch {
      setDialog({ open: true, data: mapAboutSectionToFormData(row) });
    }
  }, []);

  const handleToggle = useCallback(async (row) => {
    try {
      const newStatus = row.is_active === 1 || row.is_active === true ? 0 : 1;
      const mapped = mapAboutSectionToFormData({ ...row, is_active: newStatus });
      const fd = buildAboutSectionPayload(mapped);
      await aboutApi.updateSection(row.section_id, fd);
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
      const name = deleteTarget.title || deleteTarget.section_key;
      await aboutApi.deleteSection(deleteTarget.section_id);
      setDeleteTarget(null);
      fetchData();
      showToast.undo(`Moved "${name}" to trash.`, async () => {
        try {
          await trashApi.restore('about_sections', deleteTarget.section_id);
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
      await trashApi.restore('about_sections', row.section_id);
      showToast.success(`Restored "${row.title || row.section_key}".`);
      fetchData();
    } catch {
      showToast.error('Failed to restore section.');
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const handleManageItems = useCallback((section) => setManagingItems(section), []);
  const handleManageGallery = useCallback((section) => setManagingGallery(section), []);

  const columns = useMemo(() => getAboutSectionsColumns({
    onEdit: handleEdit,
    onDelete: setDeleteTarget,
    onManageItems: handleManageItems,
    onManageGallery: handleManageGallery,
    onToggle: handleToggle,
    onRestore: handleRestore,
    isTrash: viewMode === 'trash',
  }), [handleEdit, handleManageItems, handleManageGallery, handleToggle, viewMode]);

  if (managingItems) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <ItemsManager
          sectionId={managingItems.section_id}
          sectionTitle={`${managingItems.title || managingItems.section_key}`}
          onBack={() => setManagingItems(null)}
        />
      </div>
    );
  }

  if (managingGallery) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <GalleryManager
          sectionId={managingGallery.section_id}
          sectionTitle={`${managingGallery.title || managingGallery.section_key}`}
          onBack={() => setManagingGallery(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">About Page Sections</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage dynamic content for the About Us page.</p>
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
        entityLabel="About Section"
        fields={aboutSectionsFields}
        editData={dialog.data}
        apiCreate={aboutApi.createSection}
        apiUpdate={aboutApi.updateSection}
        getIdFromData={(data) => data.section_id}
        buildPayload={buildAboutSectionPayload}
        onSuccess={handleSuccess}
        renderPreview={(values) => <AboutSectionPreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget?.title || deleteTarget?.section_key}
        entityLabel="About Section"
      />
    </div>
  );
}
