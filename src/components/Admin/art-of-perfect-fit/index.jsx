"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Save, CheckCircle, Trash2 } from 'lucide-react';
import DataTable from '@/sharables/DataTable';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { artOfPerfectFitAPI } from '@/api/artOfPerfectFit.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getStepColumns } from './columns';
import { stepFields, mapStepToFormData, buildStepPayload } from './fields';
import ArtOfPerfectFit from '@/components/Users/shop/components/ArtOfPerfectFit';

const StepPreview = ({ formValues }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  let imgUrl = null;
  if (formValues?.image instanceof File) {
    imgUrl = URL.createObjectURL(formValues.image);
  } else if (typeof formValues?.image === 'string' && formValues.image) {
    imgUrl = `${API_URL}${formValues.image}`;
  }

  const numberLabel = (formValues?.display_order || 1).toString().padStart(2, '0');

  return (
    <section className="w-full h-full min-h-[28.125rem] bg-[#FDFBF7] py-8 overflow-hidden flex items-center justify-center border-y border-[#EAE3D2] shadow-inner">
      <div className="flex-shrink-0 w-64 md:w-80 flex flex-col">
        <div className="w-full aspect-[4/5] mb-3 sm:mb-4 relative overflow-hidden rounded-[1.5rem] bg-stone-200 flex items-center justify-center shadow-lg">
          {imgUrl ? (
             <img src={imgUrl} className="w-full h-full object-cover" alt="Preview" />
          ) : (
             <span className="text-stone-400 font-bold tracking-widest uppercase text-xs">No Image</span>
          )}
        </div>
        <div className="flex gap-5 mt-6 items-start">
          <span className="font-serif text-5xl md:text-6xl text-[#e5dcc8] font-bold leading-none shrink-0 select-none">
            {numberLabel}
          </span>
          <div className="pt-1.5">
            <h3 className="font-serif text-xl md:text-2xl text-[#161c24] font-bold leading-tight mb-2">
              {formValues?.title || 'Enter title...'}
            </h3>
            <p className="text-[#555555] text-[0.875rem] leading-relaxed">
              {formValues?.description || 'Enter description...'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function ArtOfPerfectFitManager() {
  const [data, setData] = useState({ title: '', steps: [] });
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'trash'
  const [trashData, setTrashData] = useState([]);
  const [trashTotalRows, setTrashTotalRows] = useState(0);
  const [trashPage, setTrashPage] = useState(1);
  const [trashLoading, setTrashLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await artOfPerfectFitAPI.getArtOfPerfectFit();
      setData(res.data || { title: '', steps: [] });
      setSectionTitle(res.data?.title || '');
      setIsActive(res.data?.is_active ?? true);
    } catch (error) {
      console.error('Failed to load Art of Perfect Fit data:', error);
      showToast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrashData = useCallback(async () => {
    try {
      setTrashLoading(true);
      const res = await trashApi.getDeleted('art_of_perfect_fit_steps', { page: trashPage, limit: 100 });
      setTrashData(res.data || []);
      setTrashTotalRows(res.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load trash data:', error);
      showToast.error('Failed to load trash data.');
    } finally {
      setTrashLoading(false);
    }
  }, [trashPage]);

  useEffect(() => {
    if (viewMode === 'active') {
      fetchData();
    } else {
      fetchTrashData();
    }
  }, [fetchData, fetchTrashData, viewMode]);

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback((row) => {
    setDialog({ open: true, data: mapStepToFormData(row) });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await artOfPerfectFitAPI.deleteStep(deleteTarget.step_id);
      showToast.success('Step deleted successfully.');
      setDeleteTarget(null);
      if (viewMode === 'active') fetchData();
      else fetchTrashData();
    } catch (error) {
      console.error('Error deleting step:', error);
      showToast.error('Failed to delete step.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    if (viewMode === 'active') fetchData();
    else fetchTrashData();
  }, [fetchData, fetchTrashData, viewMode]);

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('art_of_perfect_fit_steps', row.step_id);
      showToast.success(`Restored "${row.title}" successfully.`);
      fetchTrashData();
    } catch (err) {
      showToast.error('Failed to restore step from trash.');
    }
  };

  const handleSaveTitle = async () => {
    setSavingTitle(true);
    try {
      await artOfPerfectFitAPI.updateSection(sectionTitle, isActive);
      showToast.success('Section updated successfully.');
      fetchData();
    } catch (error) {
      console.error('Failed to save title:', error);
      showToast.error('Failed to save title.');
    } finally {
      setSavingTitle(false);
    }
  };

  const columns = useMemo(() => {
    return getStepColumns({ 
        onEdit: handleEdit, 
        onDelete: setDeleteTarget,
        isTrash: viewMode === 'trash',
        onRestore: handleRestore
    });
  }, [handleEdit, viewMode]);

  return (
    <div className="space-y-6 sm:space-y-8 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">The Art of Perfect Fit</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage section title and steps</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-stone-200/60 p-1 rounded-xl border border-stone-300/60 shrink-0">
            <button
              onClick={() => setViewMode('active')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'active'
                  ? 'bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#C8A64D]'
              }`}
            >
              <CheckCircle size={14} />
              <span>Active</span>
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'trash'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Trash2 size={14} />
              <span>Trash</span>
            </button>
          </div>

          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Step</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'active' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Section Title</label>
              <input 
                type="text" 
                value={sectionTitle} 
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A64D] focus:border-[#C8A64D] outline-none"
                placeholder="e.g. The Art of the Perfect Fit"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <label className="flex items-center gap-2 cursor-pointer pb-2 sm:pb-0">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-[#C8A64D] bg-gray-100 border-gray-300 rounded focus:ring-[#C8A64D] cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700">Enable Section</span>
              </label>
              <button 
                onClick={handleSaveTitle}
                disabled={savingTitle}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
              >
                <Save size={18} />
                <span>{savingTitle ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          <div className="w-full mt-8 mb-8 relative">
            <div className="absolute top-4 right-4 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-widest uppercase backdrop-blur-md">Live Preview</div>
            <div className="-mx-6">
              <ArtOfPerfectFit previewData={{ title: sectionTitle, is_active: isActive, steps: data.steps }} />
            </div>
          </div>
        </>
      )}

      <div className="w-full mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Manage Steps</h3>
        <DataTable 
          columns={columns} 
          data={viewMode === 'active' ? data.steps : trashData} 
          loading={viewMode === 'active' ? loading : trashLoading}
        />
      </div>

      <EntityDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, data: null })}
        entityLabel="Step"
        fields={stepFields}
        editData={dialog.data}
        apiCreate={(payload) => artOfPerfectFitAPI.createStep(payload)}
        apiUpdate={(id, payload) => artOfPerfectFitAPI.updateStep(id, payload)}
        getIdFromData={(data) => data.step_id}
        buildPayload={buildStepPayload}
        onSuccess={handleSuccess}
        renderPreview={(values) => <StepPreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Step"
        message={`Are you sure you want to delete step "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
