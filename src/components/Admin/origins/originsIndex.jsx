"use client";
import React, { useState, useCallback } from 'react';
import { Globe, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { originApi } from '@/api/origin.api';
import { trashApi } from '@/api/trash.api';

import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import showToast from '@/sharables/toast';

import { originFields, buildOriginPayload } from './origins.fields';
import { getOriginColumns } from './origins.columns';

const OriginsIndex = () => {
  const [viewMode, setViewMode] = useState('active');

  const apiFn = useCallback((params) => {
    return viewMode === 'active'
      ? originApi.getAll(params)
      : trashApi.getDeleted('origins', params);
  }, [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows, fetchData,
    handleSearch, handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load origins.');

  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => setDialog({ open: true, data: null });
  const openEdit = (row) => setDialog({ open: true, data: { ...row, name: row.org_name } });

  const handleSuccess = (action) => {
    fetchData();
    setDialog({ open: false, data: null });
    showToast.success(`Origin ${action === 'created' ? 'added' : 'updated'} successfully.`);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const deletedId = deleteTarget.org_id;
      const deletedName = deleteTarget.org_name || `ID #${deletedId}`;
      await originApi.remove(deletedId);
      fetchData();
      setDeleteTarget(null);

      showToast.undo(`Moved "${deletedName}" to trash.`, async () => {
        try {
          await trashApi.restore('origins', deletedId);
          showToast.success(`Restored "${deletedName}" successfully.`);
          fetchData();
        } catch (err) {
          showToast.error('Failed to restore origin.');
        }
      });
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to delete origin.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('origins', row.org_id);
      showToast.success(`Restored "${row.org_name}" successfully.`);
      fetchData();
    } catch (err) {
      showToast.error('Failed to restore origin from trash.');
    }
  };

  const columns = getOriginColumns({
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onRestore: handleRestore,
    isTrash: viewMode === 'trash',
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Fabric Origins</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage where your luxury fabrics are imported from</p>
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
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search origins..." />
          </div>

          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Origin</span>
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
        onSuccess={handleSuccess} editData={dialog.data} fields={originFields}
        entityLabel="Origin" icon={Globe}
        apiCreate={originApi.create}
        apiUpdate={originApi.update}
        getIdFromData={(row) => row.org_id}
        buildPayload={buildOriginPayload}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.org_name}
        loading={deleteLoading} entityLabel="Origin"
      />
    </div>
  );
};

export default OriginsIndex;