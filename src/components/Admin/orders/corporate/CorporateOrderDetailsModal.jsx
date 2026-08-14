"use client";
import React, { useState } from "react";
import showToast from "@/sharables/toast";
import { corporateOrderApi } from "@/api/corporateOrder.api";
import { Building2, Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";

export default function CorporateOrderDetailsModal({ inquiry, onClose, onRefresh }) {
  const [status, setStatus] = useState(inquiry.status || "Pending");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!inquiry) return null;

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await corporateOrderApi.updateStatus(inquiry.id, newStatus);
      setStatus(newStatus);
      showToast.success(`Status updated to ${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove this inquiry record?")) return;
    setDeleteLoading(true);
    try {
      await corporateOrderApi.remove(inquiry.id);
      showToast.success("Inquiry removed successfully");
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      showToast.error("Failed to delete inquiry.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-amber-100 my-8">
        {/* Header */}
        <div className="bg-[#fbf9f4] px-6 py-5 border-b border-amber-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#C8A64D] flex items-center justify-center font-bold">
              <Building2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#C8A64D]">Inquiry #{inquiry.id}</span>
              <h3 className="text-xl font-serif font-bold text-slate-900">{inquiry.company_name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge & Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inquiry Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                  status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {status}
                </span>
                <span className="text-xs text-slate-400 font-medium">No shipment or online payment required</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Change Status:</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className="text-xs font-semibold bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:border-[#C8A64D] cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Client Identity</h4>
              <div>
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-semibold">Contact Person</span>
                <span className="text-sm font-bold text-slate-900">{inquiry.name}</span>
              </div>
              <div>
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-semibold">Company / Retail Store</span>
                <span className="text-sm font-semibold text-slate-800">{inquiry.company_name}</span>
              </div>
              <div>
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-semibold">Submission Date</span>
                <span className="text-xs font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                  <Calendar size={13} className="text-slate-400" />
                  {inquiry.created_at ? String(inquiry.created_at) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Contact Channels</h4>
              <div>
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-semibold">Email Address</span>
                <a href={`mailto:${inquiry.email}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1.5 break-all mt-0.5">
                  <Mail size={14} className="shrink-0 text-slate-400" />
                  {inquiry.email}
                </a>
              </div>
              <div>
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-semibold">Phone Number</span>
                <a href={`tel:${inquiry.phone}`} className="text-sm font-bold text-slate-800 hover:text-[#C8A64D] flex items-center gap-1.5 mt-0.5">
                  <Phone size={14} className="shrink-0 text-slate-400" />
                  {inquiry.phone}
                </a>
              </div>
              <div>
                <span className="block text-[0.6875rem] text-slate-400 uppercase font-semibold">Contact Permission</span>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
                  <CheckCircle size={13} />
                  Agreed to Contact via Phone/Email
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-[#fbf9f4] p-5 rounded-xl border border-amber-200/60 shadow-inner">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C8A64D] mb-2">Requirement & Message</h4>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {inquiry.message || <span className="text-slate-400 italic">No message details provided by the client.</span>}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={15} /> Delete Record
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
