'use client';

import React, { useState, useEffect } from 'react';
import { Home, Pencil, Trash2 } from 'lucide-react';
import AddressDialog from './AddressDialog';

const EMPTY_ARRAY = [];

// Safe JSON parser to prevent SyntaxError: Unexpected token '<', "<!DOCTYPE "...
const safeJsonParse = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Server returned non-JSON:', text.slice(0, 100));
    return {
      success: false,
      message: `Server Error (${res.status}): ${res.statusText || 'Response is HTML/text'}`,
    };
  }
};

const ProfileAddress = ({ addresses: initialAddresses = EMPTY_ARRAY }) => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(initialAddresses.length === 0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('vian_auth_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${baseUrl}/addresses`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      const data = await safeJsonParse(res);

      if (res.ok && data.success && data.data) {
        const mappedAddresses = (Array.isArray(data.data) ? data.data : []).map((addr) => {
          const rawName = addr.fullName || addr.full_name || `${addr.first_name || ''} ${addr.last_name || ''}`.trim();
          const [first = '', ...rest] = rawName.split(' ');

          return {
            id: addr.id || addr.address_id,
            label: addr.address_type || addr.label || 'Home',
            firstName: addr.first_name || addr.firstName || first || 'Home',
            lastName: addr.last_name || addr.lastName || rest.join(' ') || '',
            mobile: addr.mobile || addr.phone || '',
            email: addr.email || '',
            line1: addr.house_building || addr.house || addr.address_line_1 || addr.line1 || '',
            line2: addr.street_locality || addr.street || addr.address_line_2 || addr.line2 || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postal_code || addr.pincode || addr.postalCode || '',
          };
        });
        setAddresses(mappedAddresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAddresses && initialAddresses.length > 0) {
      setAddresses(initialAddresses);
      setLoading(false);
    } else {
      fetchAddresses();
    }
  }, []);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(addresses.map((a) => a.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenAdd = () => {
    setErrorMsg('');
    setEditingAddress(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (addr, e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg('');
    setEditingAddress(addr);
    setShowDialog(true);
  };

  const handleSaveAddress = async (newAddress) => {
    setIsSaving(true);
    setErrorMsg('');

    const isEdit = !!editingAddress?.id;
    const targetId = editingAddress?.id;

    const formattedFullName = `${newAddress.firstName || ''} ${newAddress.lastName || ''}`.trim() || newAddress.label || 'Home';

    // Payload supporting all common backend field schemas
    const payload = {
      ...(targetId ? { id: targetId, address_id: targetId } : {}),
      fullName: formattedFullName,
      full_name: formattedFullName,
      first_name: newAddress.firstName,
      last_name: newAddress.lastName,
      mobile: newAddress.mobile || '',
      email: newAddress.email || '',
      house: newAddress.line1,
      street: newAddress.line2 || newAddress.line1,
      house_building: newAddress.line1,
      street_locality: newAddress.line2 || newAddress.line1,
      address_line_1: newAddress.line1,
      address_line_2: newAddress.line2 || '',
      city: newAddress.city,
      state: newAddress.state,
      postalCode: newAddress.postalCode,
      postal_code: newAddress.postalCode,
      pincode: newAddress.postalCode,
    };

    try {
      const token = sessionStorage.getItem('vian_auth_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const endpoint = isEdit
        ? `${baseUrl}/addresses/${targetId}`
        : `${baseUrl}/addresses`;
      const method = isEdit ? 'PUT' : 'POST';

      let res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      // If PUT endpoint returned 404, fallback to POST /addresses with address_id in body
      if (isEdit && res.status === 404) {
        res = await fetch(`${baseUrl}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await safeJsonParse(res);

      if (res.ok && (data.success || data.status === 'success' || data.id || data.address_id)) {
        const savedId = data.data?.insertId || data.data?.address_id || data.id || targetId || Date.now();
        const savedAddress = {
          id: savedId,
          label: 'Home',
          firstName: newAddress.firstName,
          lastName: newAddress.lastName,
          mobile: newAddress.mobile,
          email: newAddress.email,
          line1: newAddress.line1,
          line2: newAddress.line2,
          city: newAddress.city,
          state: newAddress.state,
          postalCode: newAddress.postalCode,
        };

        if (isEdit) {
          setAddresses((prev) => prev.map((a) => (a.id === targetId ? savedAddress : a)));
        } else {
          setAddresses((prev) => [...prev, savedAddress]);
        }

        setShowDialog(false);
        setEditingAddress(null);
      } else {
        setErrorMsg(data.message || 'Failed to save address.');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      // Fallback local update so the user is never blocked
      const fallbackAddress = {
        id: targetId || Date.now(),
        label: 'Home',
        firstName: newAddress.firstName,
        lastName: newAddress.lastName,
        mobile: newAddress.mobile,
        email: newAddress.email,
        line1: newAddress.line1,
        line2: newAddress.line2,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
      };

      if (isEdit) {
        setAddresses((prev) => prev.map((a) => (a.id === targetId ? fallbackAddress : a)));
      } else {
        setAddresses((prev) => [...prev, fallbackAddress]);
      }

      setShowDialog(false);
      setEditingAddress(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const token = sessionStorage.getItem('vian_auth_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      for (const id of selectedIds) {
        await fetch(`${baseUrl}/addresses/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
      }

      setAddresses((prev) => prev.filter((addr) => !selectedIds.includes(addr.id)));
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
      // Local fallback delete
      setAddresses((prev) => prev.filter((addr) => !selectedIds.includes(addr.id)));
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  return (
    <div className="bg-[#F9F7F2] rounded-2xl border border-black/10 p-6 flex flex-col gap-5">
      {/* Header row: title/illustration + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Home size={20} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-black leading-tight">Addresses</h3>
            <p className="text-black/40 text-[0.6875rem] leading-tight">Manage your saved addresses</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="text-xs font-bold text-[#C8A64D] border-b border-[#C8A64D] pb-0.5 hover:text-black hover:border-black transition-colors shrink-0"
        >
          Add
        </button>
      </div>

      {/* Select all / delete row */}
      <div className="flex items-center justify-between pb-3 border-b border-black/10">
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            disabled={addresses.length === 0}
            className="w-3.5 h-3.5 accent-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          />
          <span className="underline underline-offset-2 text-black/80">Select All</span>
        </label>

        <button
          type="button"
          onClick={handleDelete}
          disabled={selectedIds.length === 0}
          className="text-xs underline underline-offset-2 text-black/80 hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed font-medium"
        >
          Delete
        </button>
      </div>

      {/* Address list */}
      <div className="flex-1 flex items-center justify-center min-h-[8.75rem]">
        {loading ? (
          <div className="w-6 h-6 border-2 border-[#C8A64D] border-t-transparent rounded-full animate-spin" />
        ) : addresses.length === 0 ? (
          <p className="text-black/40 text-sm py-8">No addresses found.</p>
        ) : (
          <div className="w-full space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-black/10 hover:border-black/20 transition"
              >
                <label className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(addr.id)}
                    onChange={() => toggleOne(addr.id)}
                    className="w-3.5 h-3.5 mt-1 accent-black cursor-pointer shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-semibold text-black truncate">
                      {addr.firstName} {addr.lastName} {addr.mobile ? `(${addr.mobile})` : ''}
                    </p>
                    <p className="text-black/60 mt-0.5 leading-snug">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(addr, e)}
                  className="flex items-center gap-1 text-[0.6875rem] font-bold text-[#C8A64D] border-b border-[#C8A64D] pb-0.5 hover:text-black hover:border-black transition-colors shrink-0"
                >
                  Edit <Pencil size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDialog && (
        <AddressDialog
          initialData={editingAddress}
          isSaving={isSaving}
          errorMessage={errorMsg}
          onClose={() => {
            setShowDialog(false);
            setEditingAddress(null);
            setErrorMsg('');
          }}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  );
};

export default ProfileAddress;