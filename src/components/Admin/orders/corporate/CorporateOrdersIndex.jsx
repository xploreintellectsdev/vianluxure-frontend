"use client";
import React, { useCallback, useState } from "react";
import { corporateOrderApi } from "@/api/corporateOrder.api";
import useTableData from "@/hooks/useTableData";
import DataTable from "@/sharables/DataTable";
import SearchBar from "@/sharables/SearchBar";
import showToast from "@/sharables/toast";
import CorporateOrderDetailsModal from "./CorporateOrderDetailsModal";

export default function CorporateOrdersIndex() {
  const fetchOrders = useCallback((params) => corporateOrderApi.getAll(params), []);

  const {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows, fetchData,
    handleSearch, handlePageChange, handleRowsPerPageChange,
  } = useTableData(fetchOrders, "Failed to load corporate orders.");

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (row) => {
    setSelectedInquiry(row);
    setIsModalOpen(true);
  };

  const columns = [
    {
      id: "sno",
      label: "S.No",
      render: (row, sno) => sno,
    },
    {
      id: "created_at",
      label: "Date",
      render: (row) => row.created_at || "N/A",
    },
    {
      id: "company_name",
      label: "Company / Store",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.company_name}</p>
          <p className="text-xs text-slate-500 font-medium">Contact: {row.name}</p>
        </div>
      ),
    },
    {
      id: "contact",
      label: "Email & Phone",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{row.phone}</p>
          <p className="text-blue-600 font-medium truncate max-w-[11.25rem]">{row.email}</p>
        </div>
      ),
    },
    {
      id: "message",
      label: "Requirement Summary",
      render: (row) => (
        <p className="text-xs text-slate-600 line-clamp-2 max-w-[15rem] italic">
          {row.message ? `"${row.message}"` : "No specific message"}
        </p>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          row.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
          row.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
          'bg-amber-100 text-amber-800'
        }`}>
          {row.status || "Pending"}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleView(row)}
          className="text-xs font-bold px-3.5 py-1.5 bg-[#FAFAF8] border border-[#C8A64D] text-[#C8A64D] hover:bg-[#C8A64D] hover:text-white transition-colors rounded-lg shadow-2xs"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Corporate & Bulk <span className="text-[#C8A64D]">Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Bulk ordering inquiries and retail supply requests. (No online payment or shipment required).
          </p>
        </div>

        <div className="w-full sm:w-80 shrink-0">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search company, name, email or phone..."
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

      {isModalOpen && selectedInquiry && (
        <CorporateOrderDetailsModal
          inquiry={selectedInquiry}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
