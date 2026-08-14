"use client";
import React, { useState, useCallback } from 'react';
import { Layers, Plus, Trash2, CheckCircle } from 'lucide-react';
import { productTypeApi } from '@/api/productType.api';
import { trashApi } from '@/api/trash.api';

import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';

import { productTypeFields, buildProductTypePayload } from './productTypes.fields';
import { getProductTypeColumns } from './productTypes.columns';
import showToast from '@/sharables/toast';

const ProductTypesIndex = () => {
  const [viewMode, setViewMode] = useState('active');

  const apiFn = useCallback((params) => {
    return viewMode === 'active'
      ? productTypeApi.getAll(params)
      : trashApi.getDeleted('product_types', params);
  }, [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows, fetchData,
    handleSearch, handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load product types.');

  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => setDialog({ open: true, data: null });
  const openEdit = (row) => setDialog({ open: true, data: { ...row, name: row.pt_name } });

  const handleSuccess = () => {
    fetchData();
    setDialog({ open: false, data: null });
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const deletedId = deleteTarget.pt_id;
      const deletedName = deleteTarget.pt_name || `ID #${deletedId}`;
      await productTypeApi.remove(deletedId);
      fetchData();
      setDeleteTarget(null);

      showToast.undo(`Moved "${deletedName}" to trash.`, async () => {
        try {
          await trashApi.restore('product_types', deletedId);
          showToast.success(`Restored "${deletedName}" successfully.`);
          fetchData();
        } catch (err) {
          showToast.error('Failed to restore item.');
        }
      });
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to delete product type.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('product_types', row.pt_id);
      showToast.success(`Restored "${row.pt_name}" successfully.`);
      fetchData();
    } catch (err) {
      showToast.error('Failed to restore item from trash.');
    }
  };

  const columns = getProductTypeColumns({
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onRestore: handleRestore,
    isTrash: viewMode === 'trash',
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Product Types</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage your product classifications and inventory recovery</p>
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

          <div className="w-full sm:w-64 grow sm:grow-0">
            <SearchBar 
              value={search} 
              onChange={setSearch} 
              onSearch={handleSearch} 
              placeholder="Search types..." 
            />
          </div>

          {viewMode === 'active' && (
            <button 
              onClick={openCreate} 
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          totalRows={totalRows}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      <EntityDialog
        open={dialog.open} 
        onClose={() => setDialog({ open: false, data: null })}
        onSuccess={handleSuccess} 
        editData={dialog.data} 
        fields={productTypeFields}
        entityLabel="Product Type" 
        icon={Layers}
        apiCreate={productTypeApi.create}
        apiUpdate={productTypeApi.update}
        getIdFromData={(row) => row.pt_id}
        buildPayload={buildProductTypePayload}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} 
        itemName={deleteTarget?.pt_name}
        loading={deleteLoading} 
        entityLabel="Product Type"
      />
    </div>
  );
};

export default ProductTypesIndex;