'use client';
import React, { useCallback, useState } from 'react';
import { adminUserApi } from '@/api/adminUser.api';
import useTableData from '@/hooks/useTableData';
import DataTable from '@/sharables/DataTable';
import SearchBar from '@/sharables/SearchBar';
import showToast from '@/sharables/toast';
import UserDetailsModal from './UserDetailsModal';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportExcel';

export default function UsersIndex() {
    const fetchUsers = useCallback(
        (params) => adminUserApi.getAllUsers(params),
        []
    );

    const {
        data, loading, search, setSearch,
        page, rowsPerPage, totalRows, fetchData,
        handleSearch, handlePageChange, handleRowsPerPageChange,
    } = useTableData(fetchUsers, `Failed to load users.`);

    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await adminUserApi.getAllUsers({ page: 1, limit: 10000, search });
            const allData = res?.data || [];
            
            if (allData.length === 0) {
                showToast.error("No data available to export");
                return;
            }

            const exportData = allData.map(user => ({
                "User ID": user.user_id,
                "Name": user.name || 'N/A',
                "Email": user.email || 'N/A',
                "Mobile": user.mobile || 'N/A',
                "Total Orders": user.total_orders || 0,
                "Total Spent (₹)": Number(user.total_spent || 0).toFixed(2),
                "Last Login": user.last_login ? new Date(user.last_login).toLocaleString('en-GB') : 'N/A',
                "Member Since": user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'N/A',
                "Status": user.is_active ? 'Active' : 'Inactive'
            }));

            exportToExcel(exportData, `Registered_Users.xlsx`);
            showToast.success("Export successful!");
        } catch (error) {
            console.error("Export Error:", error);
            showToast.error("Failed to export data");
        } finally {
            setExporting(false);
        }
    };

    const handleView = async (user) => {
        try {
            const res = await adminUserApi.getUserDetails(user.user_id);
            setSelectedUser(res?.data || null);
            setIsViewModalOpen(true);
        } catch (err) {
            showToast.error('Failed to load user details.');
        }
    };

    const columns = [
        { id: 'user_id', label: 'ID' },
        { 
            id: 'name', 
            label: 'Name',
            render: (row) => (
                <div>
                    <div className="font-semibold text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                </div>
            )
        },
        { id: 'mobile', label: 'Mobile', render: (row) => row.mobile || 'N/A' },
        { id: 'total_orders', label: 'Total Orders', render: (row) => <span className="font-medium text-slate-700">{row.total_orders || 0}</span> },
        { id: 'total_spent', label: 'Total Spent', render: (row) => <span className="font-medium text-emerald-600">₹{Number(row.total_spent || 0).toFixed(2)}</span> },
        { 
            id: 'last_login', 
            label: 'Last Login',
            render: (row) => row.last_login ? new Date(row.last_login).toLocaleDateString('en-GB') : 'N/A'
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleView(row)}
                    className="text-sm px-3 py-1 bg-[#FAFAF8] border border-[#C8A64D] text-[#C8A64D] hover:bg-[#C8A64D] hover:text-white transition-colors rounded-md"
                >
                    View
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Registered <span className="text-[#C8A64D]">Users</span></h1>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage and view customer profiles, order history, and activity.</p>
                </div>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
                    <div className="w-full sm:w-80">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            onSearch={handleSearch}
                            placeholder="Search name, email, or mobile..."
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl shadow-sm whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Download size={18} className={exporting ? 'animate-bounce' : ''} />
                        {exporting ? 'Exporting...' : 'Export Data'}
                    </button>
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

            {isViewModalOpen && selectedUser && (
                <UserDetailsModal data={selectedUser} onClose={() => setIsViewModalOpen(false)} />
            )}
        </div>
    );
}
