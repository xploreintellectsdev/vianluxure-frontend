"use client";
import React, { useState } from "react";
import showToast from "@/sharables/toast";
import { corporateOrderApi } from "@/api/corporateOrder.api";

export default function CorporateOrderModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    message: "",
    agree_contact: false
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, agree_contact: !prev.agree_contact }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast.error("Please fill in all required fields (Name, Company, Email, Phone).");
      return;
    }
    if (!formData.agree_contact) {
      showToast.error("Please agree to be contacted to proceed.");
      return;
    }

    setLoading(true);
    try {
      await corporateOrderApi.create(formData);
      showToast.success("Thank you! Your bulk corporate order inquiry has been submitted successfully.");
      setFormData({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        message: "",
        agree_contact: false
      });
      onClose();
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-100 my-8">
        {/* Header */}
        <div className="bg-[#fbf9f4] px-6 py-5 border-b border-amber-100 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#C8A64D]">Bulk Orders for Retailers</span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">Corporate & Bulk Inquiry</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8A64D] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8A64D] transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8A64D] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8A64D] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Message & Requirement Details
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about your bulk fabric or ready-to-wear needs, quantities, or customization requests."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8A64D] transition-all resize-none"
            ></textarea>
          </div>

          {/* Toggle */}
          <div
            onClick={handleToggle}
            className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 cursor-pointer select-none hover:bg-slate-100/60 transition-all"
          >
            <div
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${formData.agree_contact ? "bg-[#C8A64D]" : "bg-slate-300"
                }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${formData.agree_contact ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
              I agree to be contacted by VIAN LUXURE via phone or email.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#C8A64D] hover:bg-[#b8974a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              Submit Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
