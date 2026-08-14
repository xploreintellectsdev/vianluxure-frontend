"use client";
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Maximize, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { fabricApi } from '@/api/fabric.api';
import { trashApi } from '@/api/trash.api';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import showToast from '@/sharables/toast';
import { fabricFields, buildFabricPayload, mapFabricDetailToFormData } from './fabrics.fields';
import { getFabricColumns } from './fabrics.columns';
import ViewFabricDialog from './ViewFabricDialog';

const FabricsIndex = () => {
  const [viewMode, setViewMode] = useState('active');

  const apiFn = useCallback((params) => {
    return viewMode === 'active'
      ? fabricApi.getAll(params)
      : trashApi.getDeleted('fabrics', params);
  }, [viewMode]);

  const { data, loading, search, setSearch, page, rowsPerPage, totalRows, fetchData, handleSearch, handlePageChange, handleRowsPerPageChange } = 
    useTableData(apiFn, 'Failed to load fabrics.');

  const router = useRouter();
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);

  const handleSuccess = (action) => {
    fetchData();
    setDialog({ open: false, data: null });
    showToast.success(`Fabric ${action} successfully!`);
  };

  const handleEdit = async (row) => {
    setEditLoadingId(row.fab_id);
    try {
      const res = await fabricApi.getById(row.fab_id);
      setDialog({ open: true, data: mapFabricDetailToFormData(res.data) });
    } catch (err) {
      showToast.error('Failed to load fabric details.');
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const deletedId = deleteTarget.fab_id;
      const deletedName = deleteTarget.fab_name || `ID #${deletedId}`;
      await fabricApi.remove(deletedId);
      setDeleteTarget(null);
      fetchData();

      showToast.undo(`Moved "${deletedName}" to trash.`, async () => {
        try {
          await trashApi.restore('fabrics', deletedId);
          showToast.success(`Restored "${deletedName}" successfully.`);
          fetchData();
        } catch (err) {
          showToast.error('Failed to restore fabric.');
        }
      });
    } catch (error) {
      showToast.error('Failed to delete fabric.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('fabrics', row.fab_id);
      showToast.success(`Restored "${row.fab_name}" successfully.`);
      fetchData();
    } catch (err) {
      showToast.error('Failed to restore fabric from trash.');
    }
  };

  const columns = getFabricColumns({ 
    onEdit: handleEdit, 
    onDelete: setDeleteTarget, 
    onView: (row) => setViewTarget(row.fab_id),
    onOpenPage: (row) => router.push(`/admin/fabrics/${row.fab_id}`),
    editLoadingId,
    onRestore: handleRestore,
    isTrash: viewMode === 'trash',
    onAddVariant: (row) => setDialog({ 
      open: true, 
      data: { ...row, groupCode: row.fab_group_code, name: `${row.fab_name} (Variation)`, _isNewVariant: true } 
    }) 
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Fabric Master</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage luxury fabrics, variations, group codes and technical specs</p>
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
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search fabrics..." />
          </div>

          {viewMode === 'active' && (
            <button onClick={() => setDialog({ open: true, data: null })} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Fabric</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <DataTable columns={columns} data={data} loading={loading} totalRows={totalRows} page={page} rowsPerPage={rowsPerPage} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} />
      </div>

      <EntityDialog
        open={dialog.open} onClose={() => setDialog({ open: false, data: null })}
        onSuccess={handleSuccess} editData={dialog.data} fields={fabricFields}
        entityLabel="Fabric" icon={Maximize}
        apiCreate={fabricApi.create}
        apiUpdate={(id, data) => fabricApi.update(id, data)}
        getIdFromData={(row) => row.fab_id}
        buildPayload={buildFabricPayload}
      />

      <ViewFabricDialog open={!!viewTarget} onClose={() => setViewTarget(null)} fabId={viewTarget} />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.fab_name}
        loading={deleteLoading} entityLabel="Fabric"
      />
    </div>
  );
};

export default FabricsIndex;