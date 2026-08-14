"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import DataTable from '@/sharables/DataTable';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { aboutApi } from '@/api/about.api';
import showToast from '@/sharables/toast';
import { aboutItemsColumns } from './aboutItems.columns';
import { aboutItemsFields, mapAboutItemToFormData, buildAboutItemPayload } from './aboutItems.fields';

export default function ItemsManager({ sectionId, sectionTitle, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await aboutApi.getItemsBySectionId(sectionId);
      setData(res.data || []);
    } catch (error) {
      console.error('Failed to load items:', error);
      showToast.error('Failed to load items.');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback((row) => {
    setDialog({ open: true, data: mapAboutItemToFormData(row) });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await aboutApi.deleteItem(deleteTarget.item_id);
      showToast.success('Item deleted successfully.');
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast.error('Failed to delete item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => [
    ...aboutItemsColumns,
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
        </div>
      )
    }
  ], [handleEdit]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all flex-shrink-0" title="Back to Sections">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Items</h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Editing Section: {sectionTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
            <Plus size={18} strokeWidth={3} />
            <span>Add Item</span>
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
        entityLabel="Item"
        fields={aboutItemsFields}
        editData={dialog.data}
        apiCreate={(payload) => aboutApi.createItem(sectionId, payload)}
        apiUpdate={(id, payload) => aboutApi.updateItem(id, payload)}
        getIdFromData={(data) => data.item_id}
        buildPayload={buildAboutItemPayload}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.item_title || 'this item'}"?`}
      />
    </div>
  );
}
