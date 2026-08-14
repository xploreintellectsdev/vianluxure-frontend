"use client";
import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import { customStyleApi } from '@/api/customStyle.api';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import showToast from '@/sharables/toast';

import { customStyleFields, buildCustomStylePayload, mapCustomStyleToFormData } from './customStyle.fields';
import { getCustomStyleColumns } from './customStyle.columns';

const CustomStyleIndex = ({ type, typeLabel }) => {
  // Pass a custom function to useTableData that always injects the "type" parameter
  const fetchApi = React.useCallback(
    (params) => customStyleApi.getAll(type, params),
    [type]
  );

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows, fetchData,
    handleSearch, handlePageChange, handleRowsPerPageChange,
  } = useTableData(fetchApi, `Failed to load ${typeLabel.toLowerCase()} styles.`);

  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => setDialog({ open: true, data: null });

  const handleEdit = async (row) => {
    try {
      const res = await customStyleApi.getById(row.option_id);
      setDialog({ open: true, data: mapCustomStyleToFormData(res.data) });
    } catch (err) {
      showToast.error('Failed to load style details.');
    }
  };

  const handleSuccess = (action) => {
    fetchData();
    setDialog({ open: false, data: null });
    showToast.success(`${typeLabel} style ${action === 'created' ? 'added' : 'updated'} successfully.`);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await customStyleApi.remove(deleteTarget.option_id);
      showToast.success(`${typeLabel} style deleted successfully.`);
      fetchData();
      setDeleteTarget(null);
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to delete style.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = getCustomStyleColumns({ onEdit: handleEdit, onDelete: setDeleteTarget, typeLabel });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">{typeLabel} <span className="text-[#C8A64D]">Styles</span></h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage luxury tailoring options, extra charges and imagery for bespoke {typeLabel.toLowerCase()}s</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-72 grow sm:grow-0">
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder={`Search ${typeLabel.toLowerCase()}s...`} />
          </div>
          <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
            <Plus size={18} strokeWidth={3} />
            <span>Add {typeLabel}</span>
          </button>
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
        onSuccess={handleSuccess} editData={dialog.data} fields={customStyleFields(typeLabel)}
        entityLabel={`${typeLabel} Style`} icon={Settings}
        // Pass the type parameter explicitly to the api call!
        apiCreate={(payload) => customStyleApi.create(type, payload)}
        apiUpdate={customStyleApi.update}
        getIdFromData={(row) => row.option_id}
        buildPayload={buildCustomStylePayload}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.option_name}
        loading={deleteLoading} entityLabel={`${typeLabel} Style`}
      />
    </div>
  );
};

export default CustomStyleIndex;