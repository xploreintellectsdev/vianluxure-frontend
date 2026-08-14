'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const inputClass =
  "w-full p-3 rounded-lg bg-black/[0.05] border border-black/10 outline-none focus:ring-2 focus:ring-[#C8A64D]/40 transition text-black placeholder:text-black/40 text-sm";

const AddressDialog = ({ onClose, onSave, initialData = null, isSaving = false, errorMessage = '' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || initialData.first_name || '',
        lastName: initialData.lastName || initialData.last_name || '',
        email: initialData.email || '',
        mobile: initialData.mobile || initialData.phone || '',
        line1: initialData.line1 || initialData.house || initialData.address_line_1 || '',
        line2: initialData.line2 || initialData.street || initialData.address_line_2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || initialData.postal_code || initialData.pincode || '',
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.line1 || !formData.city) return;

    onSave({
      ...formData,
      id: initialData?.id,
    });
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/10 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-black">{initialData ? 'Edit Address' : 'Add Address'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-red-500 hover:text-red-600 transition">
            <X size={22} />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">First Name *</label>
              <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">Last Name</label>
              <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">Mobile *</label>
              <input type="tel" name="mobile" placeholder="Mobile number" value={formData.mobile} onChange={handleInputChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">Email</label>
              <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleInputChange} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-black/80">Street Address (Line 1 / House) *</label>
            <input type="text" name="line1" placeholder="House/Building name or number" value={formData.line1} onChange={handleInputChange} required className={inputClass} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-black/80">Street Address (Line 2 / Locality)</label>
            <input type="text" name="line2" placeholder="Street, landmark or area (optional)" value={formData.line2} onChange={handleInputChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">City *</label>
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">State *</label>
              <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-black/80">Postal Code *</label>
              <input type="text" name="postalCode" placeholder="Pincode" value={formData.postalCode} onChange={handleInputChange} required className={inputClass} />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#C8A64D] hover:bg-black text-black hover:text-white py-3 rounded-xl font-bold transition disabled:opacity-50 text-sm"
            >
              {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressDialog;