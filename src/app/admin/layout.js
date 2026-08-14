"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Admin/layout/Sidebar";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function AdminLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsLoggedIn(true);
    }
    setChecking(false);

    const handleLogout = () => setIsLoggedIn(false);
    window.addEventListener("admin-logout", handleLogout);
    return () => window.removeEventListener("admin-logout", handleLogout);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("adminToken", data.data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.data.admin));
        setIsLoggedIn(true);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Unable to reach authentication server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7] text-[#C8A64D] font-serif">
        Initializing Admin Portal...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Luxury subtle background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C8A64D]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#C8A64D]/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <img src="/images/logo/vl_logo.png" alt="Vian Luxure" className="h-24 sm:h-28 w-auto object-contain mb-5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
            <span className="text-xs font-mono font-extrabold tracking-widest text-[#C8A64D] uppercase bg-[#C8A64D]/10 px-3 py-1 rounded border border-[#C8A64D]/30 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> VIAN LUXURE PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Admin Sign In
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Enter your authorized credentials to access the console
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the Email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C8A64D] focus:ring-2 focus:ring-[#C8A64D]/20 outline-none text-sm font-medium text-slate-800 transition-all bg-stone-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C8A64D] focus:ring-2 focus:ring-[#C8A64D]/20 outline-none text-sm font-medium text-slate-800 transition-all bg-stone-50/50 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide disabled:opacity-50 mt-2 active:scale-[0.99]"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-[0.6875rem] text-slate-400 font-medium">
              Default Superadmin Login: <span className="text-slate-600 font-mono font-bold">admin@vlglobal.com</span> / <span className="text-slate-600 font-mono font-bold">Xplore@123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFBF7] font-sans text-slate-800 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}