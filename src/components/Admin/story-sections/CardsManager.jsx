"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import DataTable from '@/sharables/DataTable';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { storySectionApi } from '@/api/storySection.api';
import showToast from '@/sharables/toast';
import { getCardsColumns } from './cards.columns';
import { cardsFields, mapCardToFormData, buildCardPayload } from './cards.fields';

const CardPreview = ({ formValues }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  let imgUrl = null;
  if (formValues?.image instanceof File) {
    imgUrl = URL.createObjectURL(formValues.image);
  } else if (typeof formValues?.image === 'string' && formValues.image) {
    imgUrl = `${API_URL}${formValues.image}`;
  }

  const numberLabel = (formValues?.order_no || 1).toString().padStart(2, '0');

  return (
    <section className="w-full h-full min-h-[28.125rem] bg-[#FDFBF7] py-8 overflow-hidden flex items-center justify-center border-y border-[#EAE3D2] shadow-inner">
      <div className="flex-shrink-0 w-64 md:w-80 flex flex-col">
        <div className="w-full aspect-[4/3] mb-3 sm:mb-4 relative overflow-hidden rounded-2xl bg-stone-200 flex items-center justify-center shadow-lg">
          {imgUrl ? (
             <img src={imgUrl} className="w-full h-full object-cover" alt="Preview" />
          ) : (
             <span className="text-stone-400 font-bold tracking-widest uppercase text-xs">No Image</span>
          )}
        </div>
        <p className="italic text-center text-stone-600 text-[0.8125rem] sm:text-[0.875rem] leading-snug mb-3 sm:mb-4 min-h-[2.25rem] sm:min-h-[2.625rem]">
          {formValues?.caption || 'Enter caption...'}
        </p>
        <span className="text-lg sm:text-xl font-extrabold text-[#C8A64D] mb-1.5 block">
          {numberLabel}
        </span>
        <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-snug mb-2 sm:mb-2.5 font-serif">
          {formValues?.card_title || 'Enter card title...'}
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          {formValues?.card_description || 'Enter description...'}
        </p>
      </div>
    </section>
  );
};

export default function CardsManager({ sectionId, sectionTitle, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storySectionApi.getSectionById(sectionId);
      setData(res.data?.cards || []);
    } catch (error) {
      console.error('Failed to load cards:', error);
      showToast.error('Failed to load cards.');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback((row) => {
    setDialog({ open: true, data: mapCardToFormData(row) });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await storySectionApi.deleteCard(deleteTarget.card_id);
      showToast.success('Card deleted successfully.');
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting card:', error);
      showToast.error('Failed to delete card.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getCardsColumns({ onEdit: handleEdit, onDelete: setDeleteTarget, sectionId }), [handleEdit, sectionId]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all flex-shrink-0" title="Back to Sections">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Cards</h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Section: {sectionTitle || 'Story Section'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
            <Plus size={18} strokeWidth={3} />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      <div className="w-full">
        <DataTable 
          columns={columns} 
          data={data} 
          loading={loading}
        />
      </div>

      <EntityDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, data: null })}
        entityLabel="Card"
        fields={cardsFields}
        editData={dialog.data}
        apiCreate={(payload) => storySectionApi.createCard(sectionId, payload)}
        apiUpdate={(id, payload) => storySectionApi.updateCard(id, payload)}
        getIdFromData={(data) => data.card_id}
        buildPayload={buildCardPayload}
        onSuccess={handleSuccess}
        renderPreview={(values) => <CardPreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Card"
        message={`Are you sure you want to delete "${deleteTarget?.card_title}"?`}
      />
    </div>
  );
}
