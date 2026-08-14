"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { BookOpen, Plus, CheckCircle, Trash2 } from 'lucide-react';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { blogApi } from '@/api/blog.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import { getBlogsColumns } from './blogs.columns';
import { blogsFields, mapBlogToFormData, buildBlogPayload } from './blogs.fields';

const BlogsIndex = () => {
  const [viewMode, setViewMode] = useState('active');

  const apiFn = useCallback((params) => {
    return viewMode === 'active'
      ? blogApi.getAll(params)
      : trashApi.getDeleted('blogs', params);
  }, [viewMode]);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  } = useTableData(apiFn, 'Failed to load blog posts.');

  const [dialog, setDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = useCallback(() => setDialog({ open: true, data: null }), []);

  const handleEdit = useCallback(async (row) => {
    try {
      const res = await blogApi.getById(row.blog_id);
      const itemData = res.data?.data || res.data || row;
      setDialog({ open: true, data: mapBlogToFormData(itemData) });
    } catch (error) {
      console.error('Error loading blog details:', error);
      setDialog({ open: true, data: mapBlogToFormData(row) });
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const deletedId = deleteTarget.blog_id;
      const deletedTitle = deleteTarget.blog_title || `ID #${deletedId}`;
      await blogApi.remove(deletedId);
      setDeleteTarget(null);
      fetchData();

      showToast.undo(`Moved "${deletedTitle}" to trash.`, async () => {
        try {
          await trashApi.restore('blogs', deletedId);
          showToast.success(`Restored "${deletedTitle}" successfully.`);
          fetchData();
        } catch (err) {
          showToast.error('Failed to restore blog post.');
        }
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      showToast.error('Failed to delete blog post.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('blogs', row.blog_id);
      showToast.success(`Restored "${row.blog_title}" successfully.`);
      fetchData();
    } catch (err) {
      showToast.error('Failed to restore blog from trash.');
    }
  };

  const handleSuccess = useCallback(() => {
    setDialog({ open: false, data: null });
    fetchData();
  }, [fetchData]);

  const columns = useMemo(
    () => getBlogsColumns({
      onEdit: handleEdit,
      onDelete: setDeleteTarget,
      onRestore: handleRestore,
      isTrash: viewMode === 'trash',
    }),
    [handleEdit, viewMode]
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Blog Management</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Create and publish editorial articles and brand news stories.</p>
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
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Search blog titles..." />
          </div>

          {viewMode === 'active' && (
            <button onClick={openCreate} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg shrink-0 w-full sm:w-auto">
              <Plus size={18} strokeWidth={3} />
              <span>Add Blog Post</span>
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
        onSuccess={handleSuccess} editData={dialog.data} fields={blogsFields}
        entityLabel="Blog Post" icon={BookOpen}
        apiCreate={blogApi.create}
        apiUpdate={blogApi.update}
        getIdFromData={(row) => row.blog_id}
        buildPayload={buildBlogPayload}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} itemName={deleteTarget?.blog_title}
        loading={deleteLoading} entityLabel="Blog Post"
      />
    </div>
  );
};

export default BlogsIndex;
