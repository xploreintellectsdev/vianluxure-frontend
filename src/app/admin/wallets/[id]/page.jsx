'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Wallet, History, X, ArrowLeft, AlertCircle } from 'lucide-react';
import DataTable from '@/sharables/DataTable';

export default function AdminWalletDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Credit Modal State
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('Birthday Gift');
  const [creditRemarks, setCreditRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Transaction table pagination (client-side)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchWalletDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.dispatchEvent(new Event('admin-logout'));
        router.push('/admin');
        return;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets/admin/user/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('admin-logout'));
        router.push('/admin');
        return;
      }
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to load user wallet details.');
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while loading wallet details.');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchWalletDetails();
  }, [id, fetchWalletDetails]);

  const handleCreditWallet = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!creditAmount || isNaN(creditAmount) || Number(creditAmount) <= 0) {
      setFormError('Enter a valid positive amount');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets/admin/credit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: id,
            amount: creditAmount,
            reason: creditReason,
            remarks: creditRemarks || null,
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setShowCreditModal(false);
        setCreditAmount('');
        setCreditRemarks('');
        fetchWalletDetails();
      } else {
        setFormError(result.error || 'Failed to credit wallet.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Error crediting wallet. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-base font-semibold px-4 py-2 rounded-xl border transition-all hover:scale-[1.02] mb-6"
      style={{ borderColor: 'var(--color-text-border)', color: 'var(--color-text-charcoal)', background: '#fff' }}
    >
      <ArrowLeft size={16} /> Back
    </button>
  );

  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-8 animate-pulse" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="h-9 w-24 rounded-xl" style={{ background: 'var(--section-bg)' }} />
        <div className="h-8 w-64 rounded-lg" style={{ background: 'var(--section-bg)' }} />
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="h-48 rounded-2xl" style={{ background: 'var(--section-bg)' }} />
          <div className="h-48 rounded-2xl" style={{ background: 'var(--section-bg)' }} />
        </div>
        <div className="h-64 rounded-3xl" style={{ background: 'var(--section-bg)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10" style={{ fontFamily: 'var(--font-sans)' }}>
        <BackButton />
        <div
          className="flex items-center gap-3 text-base font-medium px-5 py-4 rounded-2xl border"
          style={{ background: '#fdf2f0', borderColor: '#f0c9c2', color: '#9a3324' }}
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={fetchWalletDetails} className="ml-auto text-sm font-bold underline underline-offset-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="p-6 md:p-10" style={{ fontFamily: 'var(--font-sans)' }}>
        <BackButton />
        <div className="text-center py-14 font-semibold text-lg" style={{ color: '#9a3324' }}>
          User not found.
        </div>
      </div>
    );
  }

  const { user, transactions } = data;
  const paginatedTx = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const txColumns = [
    { id: 'created_at', label: 'Date & Time', render: (row) => (
        <span style={{ color: 'var(--color-text-muted)' }}>{new Date(row.created_at).toLocaleString('en-GB')}</span>
      ) },
    { id: 'transaction_type', label: 'Type', align: 'center', render: (row) => {
        const isCredit = row.transaction_type === 'CREDIT';
        return (
          <span
            className="inline-block px-2.5 py-1 rounded-md text-[0.6875rem] font-bold tracking-wider border"
            style={
              isCredit
                ? { color: '#3f6b4f', background: '#eef4ee', borderColor: '#cfe3d3' }
                : { color: '#9a3324', background: '#fbeae6', borderColor: '#f0c9c2' }
            }
          >
            {row.transaction_type}
          </span>
        );
      } },
    { id: 'transaction_source', label: 'Source', render: (row) => (
        <span style={{ color: 'var(--color-text-muted)' }}>{row.transaction_source}</span>
      ) },
    { id: 'order_id', label: 'Order ID', align: 'center', render: (row) => (
        <span style={{ color: 'var(--color-text-muted)' }}>{row.order_id || '-'}</span>
      ) },
    { id: 'amount', label: 'Amount', align: 'right', render: (row) => {
        const isCredit = row.transaction_type === 'CREDIT';
        return (
          <span className="font-bold" style={{ color: isCredit ? '#3f6b4f' : '#9a3324' }}>
            {isCredit ? '+' : '-'}₹{Number(row.amount).toFixed(2)}
          </span>
        );
      } },
    { id: 'balance_before', label: 'Balance Before', align: 'right', render: (row) => (
        <span style={{ color: 'var(--color-text-muted)' }}>₹{Number(row.balance_before).toFixed(2)}</span>
      ) },
    { id: 'balance_after', label: 'Balance After', align: 'right', render: (row) => (
        <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>₹{Number(row.balance_after).toFixed(2)}</span>
      ) },
    { id: 'transaction_status', label: 'Status', align: 'center', render: (row) => (
        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: '#3f6b4f' }}>
          {row.transaction_status}
        </span>
      ) },
    { id: 'remarks', label: 'Remarks', render: (row) => (
        <span className="truncate max-w-[12.5rem] inline-block" title={row.remarks} style={{ color: 'var(--color-text-muted)' }}>
          {row.remarks}
        </span>
      ) },
  ];

  return (
    <div
      className="p-6 md:p-10 space-y-10 min-h-screen"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Header — no card, sits on the page */}
      <div>
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="label-eyebrow mb-2 text-sm">Admin / Finance</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Wallet &amp; Audit
            </h1>
            <p className="text-base mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Detailed audit view of transaction history and recharge requests.
            </p>
          </div>
        </div>
      </div>

      {/* Customer + Wallet Info — plain page sections, separated by a divider, no card wrapper */}
      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <h3
            className="text-sm uppercase tracking-widest font-semibold mb-5 flex items-center gap-2 pb-3 border-b-2"
            style={{ color: 'var(--color-text-subtle)', borderColor: 'var(--color-text-border)' }}
          >
            <User size={16} /> Customer Information
          </h3>
          <div className="space-y-4 text-base font-medium" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-text-border)' }}>
              <span>Full Name:</span>
              <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>{user.name}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-text-border)' }}>
              <span>Email:</span>
              <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>{user.email}</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span>Mobile:</span>
              <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>{user.mobile || '-'}</span>
            </div>
          </div>
        </div>

        <div>
          <div
            className="flex justify-between items-center mb-5 pb-3 border-b-2"
            style={{ borderColor: 'var(--color-text-border)' }}
          >
            <h3
              className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              <Wallet size={16} /> Wallet Information
            </h3>
            <button
              onClick={() => setShowCreditModal(true)}
              className="text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 hover:scale-[1.02]"
              style={{ background: 'var(--primary-gold)' }}
            >
              Credit Wallet
            </button>
          </div>

          <div className="space-y-3 text-base font-medium" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex justify-between items-center">
              <span>Current Balance:</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-text-dark)' }}>
                ₹{Number(user.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: 'var(--color-text-border)' }}>
              <span>Wallet Status:</span>
              <span
                className="inline-block px-3 py-1 rounded-md text-xs tracking-widest font-bold border"
                style={{ color: '#3f6b4f', background: '#eef4ee', borderColor: '#cfe3d3' }}
              >
                {user.status || 'ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Recharges:</span>
              <span className="font-bold" style={{ color: '#3f6b4f' }}>
                ₹{Number(user.total_recharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Refunds:</span>
              <span className="font-bold" style={{ color: 'var(--category-gold-hover)' }}>
                ₹{Number(user.total_refunds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Wallet Payments:</span>
              <span className="font-bold" style={{ color: '#9a3324' }}>
                ₹{Number(user.total_payments || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History — header on page, table uses shared DataTable */}
      <div>
        <h3
          className="text-sm uppercase tracking-widest font-semibold mb-5 flex items-center gap-2 pb-3 border-b-2"
          style={{ color: 'var(--color-text-charcoal)', borderColor: 'var(--luxury-dark)' }}
        >
          <History size={16} /> Transaction History
        </h3>
        <DataTable
          columns={txColumns}
          data={paginatedTx}
          loading={loading}
          totalRows={transactions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </div>

      {/* Credit Wallet Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-7 relative shadow-2xl">
            <button
              onClick={() => setShowCreditModal(false)}
              className="absolute right-4 top-4 transition-colors p-1.5 rounded-full"
              style={{ color: 'var(--color-text-subtle)', background: 'var(--section-bg)' }}
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text-dark)' }}>
              Credit Wallet
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-subtle)' }}>
              Manually credit funds to this user's wallet.
            </p>

            {formError && (
              <div
                className="flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl mb-5"
                style={{ background: '#fdf2f0', color: '#9a3324' }}
              >
                <AlertCircle size={16} className="shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreditWallet} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--color-text-subtle)' }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl py-3 px-4 text-base font-medium outline-none border focus:ring-2 transition-all"
                  style={{ background: 'var(--section-bg)', borderColor: 'var(--color-text-border)', color: 'var(--color-text-dark)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary-gold)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-border)')}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--color-text-subtle)' }}>
                  Reason
                </label>
                <select
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-base font-medium outline-none border transition-all appearance-none"
                  style={{ background: 'var(--section-bg)', borderColor: 'var(--color-text-border)', color: 'var(--color-text-dark)' }}
                >
                  <option>Refund</option>
                  <option>Birthday Gift</option>
                  <option>Festival Bonus</option>
                  <option>Loyalty Reward</option>
                  <option>Compensation</option>
                  <option>Promotional Credit</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--color-text-subtle)' }}>
                  Additional Reason / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={creditRemarks}
                  onChange={(e) => setCreditRemarks(e.target.value)}
                  placeholder="Add custom reason or any content (optional)..."
                  className="w-full rounded-xl py-2.5 px-4 text-base font-medium outline-none border transition-all resize-none"
                  style={{ background: 'var(--section-bg)', borderColor: 'var(--color-text-border)', color: 'var(--color-text-dark)' }}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="flex-1 py-3 rounded-xl border text-sm font-bold transition-all"
                  style={{ borderColor: 'var(--color-text-border)', color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-md disabled:opacity-60"
                  style={{ background: 'var(--primary-gold)' }}
                >
                  {submitting ? 'Crediting...' : 'Confirm Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}