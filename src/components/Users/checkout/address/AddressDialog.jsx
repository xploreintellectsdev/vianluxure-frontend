"use client";
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Dialog, DialogTitle, DialogContent, IconButton, Fade } from "@mui/material";
import { X, Loader2 } from "lucide-react";
import { addressApi } from "@/api/address.api";
import showToast from "@/sharables/toast";
import { useAuth } from "@/hooks/Useauth";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const GUEST_ADDRESSES_KEY = "vian_guest_addresses";

// Guests can save several addresses in this browser and pick a different one
// per order. They're normalized to the exact same shape the server returns
// for a signed-in user's addresses (snake_case, `address_id`, `is_default`)
// so the rest of the checkout flow can render/select from either source
// without caring which one it is.
const readGuestAddresses = () => {
  try {
    const raw = localStorage.getItem(GUEST_ADDRESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeGuestAddresses = (addresses) => {
  localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(addresses));
};

export default function AddressDialog({ open, onClose, onAddressSaved, initialData = null }) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open && initialData) {
      reset({
        fullName: initialData.full_name || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        alternateMobile: initialData.alternate_mobile || "",
        house_building: initialData.house_building || "",
        street_locality: initialData.street_locality || "",
        landmark: initialData.landmark || "",
        postal_code: initialData.postal_code || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "India",
        addressType: initialData.address_type || "Home",
        isDefault: Boolean(Number(initialData.is_default))
      });
    } else if (open && !initialData) {
      reset({
        fullName: "",
        email: "",
        mobile: "",
        alternateMobile: "",
        house_building: "",
        street_locality: "",
        landmark: "",
        postal_code: "",
        city: "",
        state: "",
        country: "India",
        addressType: "Home",
        isDefault: false
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data) => {
    const isDefault = data.isDefault || false;

    try {
      if (user) {
        // Server payload (camelCase — see address.api.js / address.controller.js)
        const payload = {
          fullName: data.fullName,
          email: user.email || data.email || null,
          mobile: data.mobile,
          alternateMobile: data.alternateMobile || null,
          house: data.house_building,
          street: data.street_locality,
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postal_code,
          addressType: data.addressType,
          isDefault,
        };
        if (initialData && initialData.address_id) {
          await addressApi.update(initialData.address_id, payload);
          showToast.success("Address updated successfully!");
        } else {
          await addressApi.create(payload);
          showToast.success("Address saved successfully!");
        }
        onAddressSaved();
      } else {
        // Guest address — appended to or updated in browser storage
        const addresses = readGuestAddresses();
        const addressObj = {
          address_id: initialData ? initialData.address_id : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          full_name: data.fullName,
          email: data.email,
          mobile: data.mobile,
          alternate_mobile: data.alternateMobile || null,
          house_building: data.house_building,
          street_locality: data.street_locality,
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          country: data.country,
          postal_code: data.postal_code,
          address_type: data.addressType,
          is_default: isDefault,
        };

        let updated = isDefault
          ? addresses.map(a => ({ ...a, is_default: false }))
          : addresses;

        if (initialData) {
          updated = updated.map(a => a.address_id === initialData.address_id ? addressObj : a);
          showToast.success("Address updated successfully.");
        } else {
          updated.push(addressObj);
          showToast.success("Address saved for this session.");
        }
        writeGuestAddresses(updated);
        onAddressSaved(addressObj);
      }
      reset();
      onClose();
    } catch (err) {
      showToast.error(err.message || "Failed to save address.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 100005 }}
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '1.5rem',
            backgroundColor: '#FAFAF8',
            color: '#1f2937',
            backgroundImage: 'none',
          }
        },
        backdrop: { timeout: 500 },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #C8A64D', py: 2 }}>
        <span className="font-serif text-lg tracking-widest text-gray-900">
          {initialData ? "( EDIT DELIVERY ADDRESS )" : "( ADD NEW ADDRESS )"}
        </span>
      </DialogTitle>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 12, color: '#9ca3af' }}>
        <X size={24} />
      </IconButton>

      <DialogContent sx={{ paddingTop: '20px !important' }}>
        <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField label="Full Name" name="fullName" register={register} errors={errors} required />
          <div className={`grid ${user ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {!user && (
              <InputField label="Email Address" name="email" type="email" register={register} errors={errors} required />
            )}
            <InputField label="Mobile Number" name="mobile" register={register} errors={errors} required />
          </div>
          <InputField label="Alternate Mobile Number (Optional)" name="alternateMobile" register={register} errors={errors} />
          <InputField label="House / Flat / Building Name" name="house_building" register={register} errors={errors} required />
          <InputField label="Area / Street / Locality" name="street_locality" register={register} errors={errors} required />
          <InputField label="Landmark (Optional)" name="landmark" register={register} errors={errors} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Postal Code" name="postal_code" register={register} errors={errors} required />
            <InputField label="City" name="city" register={register} errors={errors} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="State" name="state" register={register} errors={errors} required />
            <InputField label="Country" name="country" defaultValue="India" register={register} errors={errors} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Address Type</label>
            <div className="flex gap-6">
              {['Home', 'Office', 'Other'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={type} {...register('addressType')} defaultChecked={type === 'Home'} className="accent-[#C8A64D] w-4 h-4" />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isDefault')} className="accent-[#C8A64D] w-4 h-4 rounded" />
              <span className="text-gray-700">Make this my default address</span>
            </label>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-8 py-3 border border-gray-300 rounded-full font-bold text-sm text-gray-700 hover:bg-gray-100 transition">CANCEL</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#C8A64D] text-white rounded-full font-bold text-sm hover:bg-[#b8974a] transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (initialData ? 'UPDATE ADDRESS' : 'SAVE ADDRESS')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Reusable Input Field with Light + Gold theme styling ──
const InputField = ({ label, name, register, errors, required, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label}{required && ' *'}</label>
    <input
      {...register(name, { required: required && `${label} is required` })}
      className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-[#C8A64D] focus:border-[#C8A64D] text-gray-900 px-3 py-2.5 placeholder:text-gray-400"
      {...props}
    />
    {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
  </div>
);