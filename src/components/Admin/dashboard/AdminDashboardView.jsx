"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  Layers,
  Users,
  Calendar,
  Activity,
  Clock,
  ShieldCheck,
  Database,
  Wallet,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardView() {
  const [data, setData] = useState({
    stats: {
      totalProducts: 0,
      totalCategories: 0,
      totalWalletAmount: 0,
      totalRevenue: 0,
      totalUsers: 0,
    },
    activities: [],
    loginHistory: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/admin/dashboard`);
      const result = await res.json();

      if (result && result.success && result.data) {
        setData(result.data);
      } else {
        setError("Failed to fetch statistics from database.");
      }
    } catch (err) {
      console.error("Error fetching database metrics:", err);
      setError("Could not connect to database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat("en-IN").format(val || 0);
  };

  const statCards = [
    {
      id: "products",
      label: "TOTAL PRODUCTS",
      value: formatNumber(data.stats.totalProducts),
      icon: ShoppingBag,
      subtext: "Active in inventory",
      highlight: false,
    },
    {
      id: "categories",
      label: "CATEGORIES",
      value: formatNumber(data.stats.totalCategories),
      icon: Layers,
      subtext: "Product catalog depth",
      highlight: false,
    },
    {
      id: "users",
      label: "TOTAL USERS",
      value: formatNumber(data.stats.totalUsers),
      icon: Users,
      subtext: "Registered accounts",
      highlight: false,
    },
    {
      id: "wallet",
      label: "WALLET AMOUNT",
      value: formatCurrency(data.stats.totalWalletAmount),
      icon: Wallet,
      subtext: "Total customer balance",
      highlight: false,
    },
    {
      id: "revenue",
      label: "TOTAL REVENUE",
      value: formatCurrency(data.stats.totalRevenue),
      icon: TrendingUp,
      subtext: "Gross store earnings",
      highlight: true, // Prominently highlighted & scaled
    },
  ];

  return (
    <div className="w-full max-w-[106.25rem] mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-12 px-3 xs:px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 font-sans overflow-x-hidden">
      {/* ── Custom Scrollbar Styling ── */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(200, 166, 77, 0.25);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(200, 166, 77, 0.5);
        }
      `}</style>

      {/* ── Header Area ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#C8A64D]/20">
        <div>
          <h1 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-sans font-bold text-slate-900 tracking-tight">
            Welcome Back !!
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 bg-[#C8A64D] hover:bg-[#B5943C] text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs shadow-xs hover:shadow-sm transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-semibold border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error} (Make sure your backend database service is online)</span>
          </div>
          <button
            onClick={() => fetchStats(true)}
            className="text-xs text-red-700 underline hover:text-red-900 font-bold cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ── Stat Metric Cards Grid ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 xs:gap-4 sm:gap-5 items-stretch">
        {statCards.map((item, index) => {
          const IconComponent = item.icon;
          const isHighlighted = item.highlight;

          return (
            <div
              key={index}
              className={`rounded-2xl transition-all duration-300 flex flex-col justify-between group relative min-w-0 overflow-hidden ${
                isHighlighted
                  ? "bg-gradient-to-br from-[#C8A64D] via-[#B89438] to-[#9E7D2B] text-white shadow-xl shadow-[#C8A64D]/30 border-2 border-[#E5C369] p-4 xs:p-5 sm:p-6 xl:sm:-translate-y-1 z-10 xs:col-span-2 md:col-span-1"
                  : "bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#C8A64D]/50 p-4 xs:p-4.5 sm:p-5"
              }`}
            >
              {/* Top hover line for normal cards */}
              {!isHighlighted && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8A64D]/40 via-[#C8A64D] to-[#C8A64D]/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
              )}

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`font-bold uppercase tracking-wider font-sans truncate ${
                      isHighlighted
                        ? "text-xs text-white/90 font-extrabold"
                        : "text-[0.6875rem] text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  <div
                    className={`rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-colors duration-200 ${
                      isHighlighted
                        ? "w-10 h-10 sm:w-11 sm:h-11 bg-white/20 text-white border border-white/40 shadow-inner"
                        : "w-8 h-8 sm:w-9 sm:h-9 bg-[#C8A64D]/10 border border-[#C8A64D]/20 text-[#C8A64D] group-hover:bg-[#C8A64D] group-hover:text-white"
                    }`}
                  >
                    <IconComponent className={isHighlighted ? "w-5 h-5 sm:w-5.5 sm:h-5.5" : "w-4 h-4 sm:w-4.5 sm:h-4.5"} />
                  </div>
                </div>

                {loading ? (
                  <div
                    className={`h-8 sm:h-9 w-24 sm:w-28 animate-pulse rounded-md my-1 ${
                      isHighlighted ? "bg-white/20" : "bg-slate-100"
                    }`}
                  />
                ) : (
                  /* Fluid font size via clamp() — value ALWAYS stays on one
                     line no matter how many digits it has, how narrow the
                     card gets, or what the browser zoom level is. This is
                     what fixes the ₹1,03,840 wrapping to two lines. */
                  <h3
                    className={`font-sans font-extrabold tracking-tight whitespace-nowrap ${
                      isHighlighted ? "text-white drop-shadow-xs" : "text-slate-900 group-hover:text-[#C8A64D] transition-colors"
                    }`}
                    style={{
                      fontSize: isHighlighted
                        ? "clamp(1.375rem, 1.1rem + 1.5vw, 2.25rem)"
                        : "clamp(1.125rem, 0.9rem + 1vw, 1.875rem)",
                      lineHeight: 1.15,
                    }}
                  >
                    {item.value}
                  </h3>
                )}
              </div>

              <div
                className={`mt-4 pt-3 flex items-center justify-between gap-2 text-[0.625rem] xs:text-[0.6875rem] font-medium border-t ${
                  isHighlighted
                    ? "border-white/25 text-white/90"
                    : "border-slate-100 text-slate-400"
                }`}
              >
                <span className="truncate">{item.subtext}</span>
                <ArrowUpRight
                  className={`shrink-0 transition-colors ${
                    isHighlighted
                      ? "w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      : "w-3.5 h-3.5 text-slate-300 group-hover:text-[#C8A64D]"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Section: Activities & Login History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 pt-2">
        
        {/* Left Panel: Recent Activities */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col h-[24rem] sm:h-[28rem] lg:h-[32.5rem] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#C8A64D]/10 flex items-center justify-center text-[#C8A64D] shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-sans font-bold text-slate-900 truncate">
                  Recent Activities
                </h3>
                <p className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-medium truncate">
                  Latest system operations and updates
                </p>
              </div>
            </div>

            <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-[#C8A64D] bg-white px-2.5 sm:px-3 py-1 rounded-full border border-[#C8A64D]/30 shadow-xs flex items-center gap-1.5 uppercase tracking-wider shrink-0">
              <Database className="w-3 h-3" />
              <span className="hidden xs:inline">Live Stream</span>
            </span>
          </div>

          {loading ? (
            <div className="p-4 sm:p-6 space-y-4 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-slate-100 animate-pulse rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.activities && data.activities.length > 0 ? (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="divide-y divide-slate-100">
                {data.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 xs:p-4 sm:p-5 hover:bg-[#C8A64D]/5 transition-colors flex items-start gap-3 sm:gap-4 group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-[#C8A64D]/30 flex items-center justify-center shrink-0 text-[#C8A64D] text-xs font-bold shadow-xs group-hover:bg-[#C8A64D] group-hover:text-white transition-colors">
                      {act.by === "Admin" ? "A" : "O"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug break-words">
                        {act.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-2 text-[0.6875rem] sm:text-xs text-slate-400 font-medium">
                        <span>
                          by <span className="text-[#C8A64D] font-semibold">{act.by || "Admin"}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          {act.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm font-medium p-6 text-center">
              <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-[#C8A64D]/20 mb-3" />
              <p className="text-slate-600 font-semibold">No recent activity logged</p>
              <p className="text-xs text-slate-400 mt-1">Actions performed in the dashboard will appear here.</p>
            </div>
          )}
        </div>

        {/* Right Panel: User Login History */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col h-[24rem] sm:h-[28rem] lg:h-[32.5rem] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#C8A64D]/10 flex items-center justify-center text-[#C8A64D] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-sans font-bold text-slate-900 truncate">
                  Login Audit Log
                </h3>
                <p className="text-[0.625rem] sm:text-[0.6875rem] text-slate-400 font-medium truncate">
                  Recent user authentications and access attempts
                </p>
              </div>
            </div>
            
            <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-slate-500 bg-slate-100 px-2.5 sm:px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider shrink-0 whitespace-nowrap">
              {data.loginHistory?.length || 0} Sessions
            </span>
          </div>

          {loading ? (
            <div className="p-4 sm:p-6 space-y-4 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-100 animate-pulse rounded w-1/2" />
                      <div className="h-3 bg-slate-100 animate-pulse rounded w-1/3" />
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-slate-100 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : data.loginHistory && data.loginHistory.length > 0 ? (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="divide-y divide-slate-100">
                {data.loginHistory.map((record, idx) => (
                  <div
                    key={`${record.id}-${idx}`}
                    className="p-3.5 xs:p-4 sm:p-5 hover:bg-[#C8A64D]/5 transition-colors flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 xs:gap-4 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C8A64D]/10 border border-[#C8A64D]/30 text-[#C8A64D] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs group-hover:bg-[#C8A64D] group-hover:text-white transition-colors tracking-wider">
                        {getInitials(record.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {record.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-1 text-[0.6875rem] sm:text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {record.time}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="font-mono text-[0.625rem] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {record.ip || "127.0.0.1"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-start xs:self-auto pl-[3.25rem] xs:pl-0">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[0.625rem] font-bold tracking-wider uppercase border shadow-xs ${
                          record.status?.toLowerCase().includes("failed")
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {record.status || "SUCCESS"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm font-medium p-6 text-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#C8A64D]/20 mb-3" />
              <p className="text-slate-600 font-semibold">No login history recorded</p>
              <p className="text-xs text-slate-400 mt-1">User authorization events will appear here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}