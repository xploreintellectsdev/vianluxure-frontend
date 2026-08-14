'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fabricApi } from '@/api/fabric.api';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';

const getImageUrl = (url) => {
  if (!url) return url;
  let finalUrl = url;
  if (finalUrl.startsWith('/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    finalUrl = `${backendUrl}${finalUrl}`;
  }
  if (typeof window !== 'undefined' && finalUrl.includes('localhost')) {
    finalUrl = finalUrl.replace('localhost', window.location.hostname);
  }
  return finalUrl;
};

export default function ReviewProductsIndex() {
  const router = useRouter();
  
  // Wrap in useCallback to prevent infinite loop in useTableData
  const fetchProducts = useCallback((params) => fabricApi.getAll(params), []);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows, fetchData,
    handleSearch, handlePageChange, handleRowsPerPageChange,
  } = useTableData(fetchProducts, 'Failed to load products.');

  const columns = [
    {
      id: 'fab_name',
      label: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.fab_cover_image ? (
            <Image
              src={getImageUrl(row.fab_cover_image)}
              alt={row.fab_name}
              width={40}
              height={40}
              unoptimized={true}
              className="w-10 h-10 object-cover rounded shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-xs font-medium text-slate-400">
              N/A
            </div>
          )}
          <span className="font-semibold text-slate-900">{row.fab_name}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push(`/admin/reviews/${row.fab_id}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-[#C8A64D]/15 to-[#B39340]/15 hover:from-[#C8A64D] hover:to-[#B39340] text-[#C8A64D] hover:text-white border border-[#C8A64D]/30 transition-all rounded-lg shadow-xs"
          >
            <MessageSquare size={16} />
            View Reviews
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Product <span className="text-[#C8A64D]">Reviews</span></h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Select a product to view and manage its customer reviews</p>
        </div>

        <div className="w-full sm:w-72 shrink-0">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search products..."
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
    </div>
  );
}
