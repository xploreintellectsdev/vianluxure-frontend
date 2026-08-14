'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw, Search, Filter, AlertCircle, ChevronRight } from 'lucide-react';
import DataTable from '@/sharables/DataTable';

const STATUS_OPTIONS = ['All Statuses', 'ACTIVE', 'SUSPENDED', 'FROZEN'];

export default function AdminWalletManagement() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.dispatchEvent(new Event('admin-logout'));
        router.push('/admin');
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets/admin/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('admin-logout'));
        router.push('/admin');
        return;
      }

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load wallet dashboard');
      }

      setStats(data.stats);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching admin wallet dashboard', err);
      setError(err.message || 'Something went wrong while loading the dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchDashboard();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchDashboard]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'All Statuses' || (u.status || 'ACTIVE') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  // reset to first page whenever the filtered set changes
  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const statusBadgeStyle = (status) => {
    if (status === 'FROZEN') {
      return { color: 'var(--color-text-charcoal)', background: 'var(--section-bg)' };
    }
    if (status === 'SUSPENDED') {
      return { color: '#92620c', background: '#fdf2da', borderColor: '#f0d99b' };
    }
    return { color: '#3f6b4f', background: '#eef4ee', borderColor: '#cfe3d3' };
  };

  const columns = [
    { id: 'name', label: 'User Name', render: (row) => (
        <span className="font-semibold" style={{ color: 'var(--color-text-dark)' }}>{row.name}</span>
      ) },
    { id: 'email', label: 'Email', render: (row) => (
        <span style={{ color: 'var(--color-text-muted)' }}>{row.email}</span>
      ) },
    { id: 'balance', label: 'Current Wallet Balance', align: 'right', render: (row) => (
        <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>
          ₹{Number(row.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ) },
    { id: 'status', label: 'Wallet Status', align: 'center', render: (row) => (
        <span
          className="inline-block px-3 py-1 rounded-md text-[0.6875rem] tracking-widest font-bold border"
          style={statusBadgeStyle(row.status)}
        >
          {row.status || 'ACTIVE'}
        </span>
      ) },
    { id: 'last_transaction_date', label: 'Last Transaction Date', render: (row) => (
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {row.last_transaction_date ? new Date(row.last_transaction_date).toLocaleString('en-GB') : 'No transactions'}
        </span>
      ) },
    { id: 'action', label: 'Action', align: 'center', render: (row) => (
        <button
          onClick={() => router.push(`/admin/wallets/${row.user_id}`)}
          className="inline-flex items-center gap-1 text-xs font-bold rounded-lg px-4 py-1.5 border transition-all hover:scale-105"
          style={{ borderColor: 'var(--color-text-border)', color: 'var(--color-text-dark)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--luxury-dark)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-dark)';
          }}
        >
          View <ChevronRight size={12} />
        </button>
      ) },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="h-8 w-64 rounded-lg" style={{ background: 'var(--section-bg)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl" style={{ background: 'var(--section-bg)' }} />
          ))}
        </div>
        <div className="h-64 rounded-3xl" style={{ background: 'var(--section-bg)' }} />
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-10 space-y-10 min-h-screen"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Header — sits directly on the page, no card */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Wallet Management
          </h1>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-base font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 hover:scale-[1.02]"
          style={{ background: 'var(--primary-gold)', color: '#fff' }}
        >
          <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 text-sm font-medium px-5 py-4 rounded-2xl border"
          style={{ background: '#fdf2f0', borderColor: '#f0c9c2', color: '#9a3324' }}
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchDashboard()} className="ml-auto text-xs font-bold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {/* Stats Row — colored blocks directly on page */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-3xl p-7" style={{ background: 'var(--luxury-dark)' }}>
          <h3 className="text-sm font-medium uppercase tracking-widest mb-3 opacity-70 text-white">Total Wallet Balance</h3>
          <div className="text-4xl font-bold tracking-tight text-white">
            ₹{Number(stats?.total_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm mt-2 opacity-60 text-white">Across all active users</div>
        </div>

        <div className="rounded-3xl p-7" style={{ background: '#e9f2ea' }}>
          <h3 className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#3f6b4f' }}>Total Wallet Recharges</h3>
          <div className="text-4xl font-bold tracking-tight" style={{ color: '#2c4d38' }}>
            ₹{Number(stats?.total_recharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm mt-2" style={{ color: '#3f6b4f' }}>Completed gateway top-ups</div>
        </div>

        <div className="rounded-3xl p-7" style={{ background: '#faf1dc' }}>
          <h3 className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--category-gold-hover)' }}>Total Wallet Refunds</h3>
          <div className="text-4xl font-bold tracking-tight" style={{ color: '#8a6a1f' }}>
            ₹{Number(stats?.total_refunds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--category-gold-hover)' }}>Order cancellation returns</div>
        </div>

        <div className="rounded-3xl p-7" style={{ background: '#fbeae6' }}>
          <h3 className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#9a3324' }}>Total Wallet Payments</h3>
          <div className="text-4xl font-bold tracking-tight" style={{ color: '#7a281c' }}>
            ₹{Number(stats?.total_payments || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm mt-2" style={{ color: '#9a3324' }}>Deducted during checkout</div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-subtle)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-xl py-2.5 pl-10 pr-4 text-base outline-none transition-all border focus:ring-2"
            style={{
              borderColor: 'var(--color-text-border)',
              color: 'var(--color-text-charcoal)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary-gold)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-border)')}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-2 text-base font-medium bg-white px-4 py-2.5 rounded-xl border transition-colors"
            style={{ borderColor: 'var(--color-text-border)', color: 'var(--color-text-charcoal)' }}
          >
            <Filter size={14} /> {statusFilter}
          </button>
          {filterOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 overflow-hidden border"
              style={{ borderColor: 'var(--color-text-border)' }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setStatusFilter(opt);
                    setFilterOpen(false);
                  }}
                  className="w-full text-left text-sm px-4 py-2.5 hover:bg-[var(--section-bg)] transition-colors"
                  style={{
                    color: statusFilter === opt ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
                    fontWeight: statusFilter === opt ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users Table — shared DataTable component */}
      <DataTable
        columns={columns}
        data={paginatedUsers}
        loading={refreshing}
        totalRows={filteredUsers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </div>
  );
}