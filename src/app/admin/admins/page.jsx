"use client";

import React, { useState, useEffect } from "react";
import { Shield, UserPlus, Trash2, CheckCircle, AlertCircle, Lock, Mail, User, Check, Edit, Eye, EyeOff } from "lucide-react";

const formatDate = (dateVal) => {
  if (!dateVal) return "N/A";
  let parsed = new Date(dateVal);
  if (isNaN(parsed.getTime()) && typeof dateVal === "string") {
    parsed = new Date(dateVal.replace(" ", "T"));
  }
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  return typeof dateVal === "string" ? dateVal.slice(0, 10) : "N/A";
};

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create admin modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Admin" });
  const [submitting, setSubmitting] = useState(false);

  // Edit Admin State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editStep, setEditStep] = useState("form"); // "form" | "otp"

  const openEditModal = (adm) => {
    setEditAdmin(adm);
    const existingPass = adm.plain_password || (adm.password && !adm.password.startsWith('$2') ? adm.password : "") || "";
    setEditForm({ name: adm.name || "", email: adm.email || "", password: existingPass, otp: "" });
    setShowPassword(false);
    setEditStep("form");
    setShowEditModal(true);
    setError("");
    setSuccess("");
  };

  const handleUpdateAdmin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editAdmin) return;
    
    const isSuper = editAdmin.admin_id === 1 || (editAdmin.role || "").toLowerCase().includes("super");
    const origPass = editAdmin.plain_password || (editAdmin.password && !editAdmin.password.startsWith('$2') ? editAdmin.password : "") || "";
    const isPassChanged = editForm.password && editForm.password !== origPass && editForm.password !== editAdmin.password;
    const isEmailChanged = (editForm.email || "").trim().toLowerCase() !== (editAdmin.email || "").trim().toLowerCase();
    const needsOtp = isSuper && (isPassChanged || isEmailChanged);

    if (needsOtp && editStep === "form") {
      setEditLoading(true);
      setError("");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/admin/admins/send-superadmin-otp`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setMaskedEmail(data.data?.maskedEmail || "personal email");
          setSuccess(data.message || "OTP sent to personal email");
          setEditStep("otp");
          return;
        } else {
          setError(data.message || "Failed to send OTP code.");
          return;
        }
      } catch (err) {
        setError("Server communication error while requesting OTP.");
        return;
      } finally {
        setEditLoading(false);
      }
    }

    if (needsOtp && (!editForm.otp || editForm.otp.length < 6)) {
      setError("Please enter the 6-digit OTP sent to your personal email.");
      return;
    }

    setEditLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/admins/${editAdmin.admin_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Administrator details updated successfully for ${editForm.name}!`);
        setShowEditModal(false);
        setEditAdmin(null);
        fetchAdmins();
        try {
          const stored = localStorage.getItem("adminUser");
          if (stored) {
            const user = JSON.parse(stored);
            if (user && (user.admin_id === editAdmin.admin_id || user.email === editAdmin.email)) {
              localStorage.setItem("adminUser", JSON.stringify({ ...user, name: editForm.name, email: editForm.email }));
            }
          }
        } catch (err) {}
      } else {
        setError(data.message || "Failed to update administrator details.");
      }
    } catch (err) {
      setError("Failed to reach authentication server.");
    } finally {
      setEditLoading(false);
    }
  };

  // Password Change State
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [passForm, setPassForm] = useState({ newPassword: "", otp: "" });
  const [passStep, setPassStep] = useState("form"); // "form" | "otp"
  const [maskedEmail, setMaskedEmail] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const openPasswordModal = (adm) => {
    setSelectedAdmin(adm);
    setPassForm({ newPassword: "", otp: "" });
    setPassStep("form");
    setShowPassModal(true);
    setError("");
    setSuccess("");
  };

  const handleSendSuperOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!passForm.newPassword || passForm.newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setPassLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/admins/send-superadmin-otp`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.data?.maskedEmail || "personal email");
        setSuccess(data.message || "OTP sent to personal email");
        setPassStep("otp");
      } else {
        setError(data.message || "Failed to send OTP code.");
      }
    } catch (err) {
      setError("Server communication error while requesting OTP.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const isSuper = selectedAdmin && (selectedAdmin.admin_id === 1 || (selectedAdmin.role || "").toLowerCase().includes("super"));

    if (isSuper && passStep === "form") {
      return handleSendSuperOtp(e);
    }

    if (isSuper && (!passForm.otp || passForm.otp.length < 6)) {
      setError("Please enter the 6-digit OTP sent to your personal email.");
      return;
    }

    setPassLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/admins/${selectedAdmin.admin_id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: passForm.newPassword,
          otp: passForm.otp
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Password updated successfully for ${selectedAdmin.name}!`);
        setShowPassModal(false);
        setSelectedAdmin(null);
      } else {
        setError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setError("Failed to communicate with authentication server.");
    } finally {
      setPassLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/admins`);
      const data = await res.json();
      if (data.success && data.data) {
        setAdmins(data.data);
      }
    } catch (err) {
      setError("Failed to fetch admin accounts from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("New administrator created successfully!");
        setForm({ name: "", email: "", password: "", role: "Admin" });
        setShowModal(false);
        fetchAdmins();
      } else {
        setError(data.message || "Failed to create administrator");
      }
    } catch (err) {
      setError("Server communication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this administrator account?")) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/admins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccess("Administrator account removed.");
        fetchAdmins();
      } else {
        alert(data.message || "Could not delete administrator");
      }
    } catch (err) {
      alert("Delete operation failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-[#C8A64D]" />
            Administrator Accounts
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create and manage multiple administrator accounts with specialized access
          </p>
        </div>

        <button
          onClick={() => { setShowModal(true); setError(""); setSuccess(""); }}
          className="bg-[#C8A64D] hover:bg-[#B39340] text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm uppercase tracking-wide"
        >
          <UserPlus className="w-4 h-4" />
          Add New Admin
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2 text-sm font-bold">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          {success}
        </div>
      )}

      {/* Admin Users Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
            Loading administrator accounts...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium italic">
            No administrator accounts found in database.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[0.6875rem] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Administrator Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Access Role</th>
                <th className="py-4 px-6">Created On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {admins.map((adm) => (
                <tr key={adm.admin_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">
                    #{adm.admin_id}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C8A64D]/15 border border-[#C8A64D]/35 text-[#C8A64D] text-xs font-extrabold flex items-center justify-center shrink-0">
                      {adm.name ? adm.name.substring(0, 2).toUpperCase() : "AD"}
                    </div>
                    {adm.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600">
                    {adm.email}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md bg-[#C8A64D]/15 text-[#9A7D34] border border-[#C8A64D]/30 text-[0.6875rem] font-extrabold uppercase tracking-wider">
                      {adm.role || "Admin"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                    {formatDate(adm.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(adm)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Administrator Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPasswordModal(adm)}
                        className="p-2 text-slate-400 hover:text-[#C8A64D] hover:bg-amber-50 rounded-xl transition-colors"
                        title="Change Password"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      {adm.admin_id === 1 ? (
                        <span className="text-[0.6875rem] font-bold text-slate-400 italic bg-slate-100 px-2.5 py-1 rounded-md">
                          Primary Superadmin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDelete(adm.admin_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Remove Administrator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Creating New Admin */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#C8A64D]" />
              Create Administrator
            </h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Grant management permissions to a new staff member or executive.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#C8A64D] outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter Email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#C8A64D] outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength="4"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#C8A64D] outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C8A64D] hover:bg-[#B39340] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm uppercase tracking-wide disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Changing Password */}
      {showPassModal && selectedAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            {passStep === "otp" ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F5F0E1] text-[#C8A64D] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">( VERIFY SUPERADMIN OTP )</h2>
                <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                  To secure Super Admin credentials, enter the 6-digit verification code sent to your personal email (<span className="font-bold text-slate-800">{maskedEmail}</span>).
                </p>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={passForm.otp}
                      onChange={(e) => setPassForm({ ...passForm, otp: e.target.value.replace(/\D/g, "") })}
                      placeholder="000000"
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-center font-mono text-3xl tracking-[0.4em] font-black text-slate-900 focus:ring-2 focus:ring-[#C8A64D] focus:border-[#C8A64D] outline-none transition shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={passLoading || passForm.otp.length < 6}
                      className="w-full bg-[#C8A64D] hover:bg-[#B39340] text-white font-bold py-3.5 rounded-full shadow-md transition text-sm uppercase tracking-wider disabled:opacity-50"
                    >
                      {passLoading ? "Verifying & Updating..." : "VERIFY & UPDATE PASSWORD"}
                    </button>
                    <button
                      type="button"
                      disabled={passLoading}
                      onClick={() => handleSendSuperOtp(null)}
                      className="text-xs text-[#C8A64D] font-bold hover:underline py-1 uppercase tracking-wider"
                    >
                      Resend Verification Code
                    </button>
                    <button
                      type="button"
                      disabled={passLoading}
                      onClick={() => setPassStep("form")}
                      className="text-xs text-slate-400 hover:text-slate-600 underline mt-1"
                    >
                      &larr; Back to edit new password
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#C8A64D]" />
                  Change Password ({selectedAdmin.name})
                </h2>
                <p className="text-xs text-slate-500 mb-6 font-medium">
                  Set a new access password for this administrator account.
                </p>
                
                {(selectedAdmin.admin_id === 1 || (selectedAdmin.role || "").toLowerCase().includes("super")) && (
                  <div className="mb-6 p-3.5 bg-amber-50/80 border border-[#C8A64D]/30 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold block mb-1">🔐 Super Admin Security Notice:</span>
                    Changing Super Admin password requires a 6-digit OTP confirmation code sent to your configured personal email address.
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        minLength={4}
                        value={passForm.newPassword}
                        onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#C8A64D] outline-none text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPassModal(false)}
                      className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passLoading}
                      className="bg-[#C8A64D] hover:bg-[#B39340] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm uppercase tracking-wide disabled:opacity-50"
                    >
                      {passLoading
                        ? "Processing..."
                        : selectedAdmin.admin_id === 1 || (selectedAdmin.role || "").toLowerCase().includes("super")
                        ? "CONTINUE TO VERIFY OTP"
                        : "UPDATE PASSWORD"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Editing Administrator Details */}
      {showEditModal && editAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            {editStep === "otp" ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">( VERIFY SUPERADMIN OTP )</h2>
                <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                  To authorize changing Super Admin credentials, enter the 6-digit verification code sent to your personal email (<span className="font-bold text-slate-800">{maskedEmail}</span>).
                </p>
                <form onSubmit={handleUpdateAdmin} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={editForm.otp}
                      onChange={(e) => setEditForm({ ...editForm, otp: e.target.value.replace(/\D/g, "") })}
                      placeholder="000000"
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-center font-mono text-3xl tracking-[0.4em] font-black text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none transition shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={editLoading || (editForm.otp || "").length < 6}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-full shadow-md transition text-sm uppercase tracking-wider disabled:opacity-50"
                    >
                      {editLoading ? "Verifying & Saving..." : "VERIFY & SAVE CHANGES"}
                    </button>
                    <button
                      type="button"
                      disabled={editLoading}
                      onClick={() => {
                        setEditStep("form");
                        const origPass = editAdmin.plain_password || "";
                        setEditForm({ ...editForm, password: origPass });
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline mt-1"
                    >
                      &larr; Cancel password change & Back
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  Edit Administrator Details
                </h2>
                <p className="text-xs text-slate-500 mb-6 font-medium">
                  Modify credentials and profile details for {editAdmin.name}.
                </p>

                <form onSubmit={handleUpdateAdmin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter Name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Enter Email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password (View Existing / Edit)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={editForm.password || ""}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-sm font-bold text-slate-800 tracking-wide font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-blue-600 transition-colors"
                        title={showPassword ? "Hide Password" : "Show Existing Password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {editForm.password === "" && (
                      <p className="text-[0.6875rem] text-slate-400 mt-1 italic">
                        * Existing password is stored as a secure hash. Enter a new password here to update it and enable viewing.
                      </p>
                    )}
                    {(editAdmin.admin_id === 1 || (editAdmin.role || "").toLowerCase().includes("super")) && (
                      <p className="text-[0.6875rem] text-amber-600 mt-1 font-bold">
                        🔐 Note: Changing Super Admin email or password requires OTP confirmation from personal email.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm uppercase tracking-wide disabled:opacity-50"
                    >
                      {editLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
