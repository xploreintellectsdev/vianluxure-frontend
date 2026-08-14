'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle, Trash2 } from 'lucide-react';
import { reviewApi } from '@/api/review.api';
import { trashApi } from '@/api/trash.api';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import showToast from '@/sharables/toast';
import { getReviewColumns } from './reviews.columns';
import ReviewEditModal from './ReviewEditModal';

export default function ReviewsIndex({ fabricId }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('active');
  
  const fetchReviews = useCallback(
    (params) => viewMode === 'active'
      ? reviewApi.getAllAdminReviews({ ...params, fab_id: fabricId })
      : trashApi.getDeleted('reviews', { ...params, fab_id: fabricId }),
    [fabricId, viewMode]
  );

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows, fetchData,
    handleSearch, handlePageChange, handleRowsPerPageChange,
  } = useTableData(fetchReviews, 'Failed to load reviews.');

  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (review) => {
    setSelectedReview(review);
    setIsEditModalOpen(true);
  };

  const handleToggleVisibility = async (review) => {
    try {
      await reviewApi.updateReview(review.rev_id, { is_approved: !review.is_approved });
      showToast.success(review.is_approved ? 'Review hidden successfully' : 'Review approved successfully');
      fetchData();
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to update visibility');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const deletedId = deleteTarget.rev_id;
      const deletedName = deleteTarget.customer_name ? `review by ${deleteTarget.customer_name}` : `Review #${deletedId}`;
      await reviewApi.remove(deletedId);
      setDeleteTarget(null);
      fetchData();

      showToast.undo(`Moved ${deletedName} to trash.`, async () => {
        try {
          await trashApi.restore('reviews', deletedId);
          showToast.success(`Restored ${deletedName} successfully.`);
          fetchData();
        } catch (err) {
          showToast.error('Failed to restore review.');
        }
      });
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (review) => {
    try {
      await trashApi.restore('reviews', review.rev_id);
      showToast.success('Review restored successfully.');
      fetchData();
    } catch (err) {
      showToast.error('Failed to restore review from trash.');
    }
  };

  const columns = getReviewColumns(
    handleEdit,
    handleToggleVisibility,
    (row) => setDeleteTarget(row),
    handleRestore,
    viewMode === 'trash'
  );

  const handleModalClose = (wasUpdated) => {
    setIsEditModalOpen(false);
    setSelectedReview(null);
    if (wasUpdated) {
      fetchData();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/reviews')}
            className="p-2.5 bg-white hover:bg-stone-50 text-slate-600 border border-stone-200/80 rounded-full transition-all shadow-xs"
            title="Back to Products"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Customer <span className="text-[#C8A64D]">Reviews</span></h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage feedback and testimonials for this luxury product</p>
          </div>
        </div>

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
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search customer reviews..."
          />
        </div>
      </div>

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

      {isEditModalOpen && selectedReview && (
        <ReviewEditModal review={selectedReview} onClose={handleModalClose} />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.customer_name ? `review by ${deleteTarget.customer_name}` : `Review #${deleteTarget?.rev_id}`}
        loading={deleteLoading}
        entityLabel="Review"
      />
    </div>
  );
}
