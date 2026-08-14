"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle, ShieldCheck, Zap, AlertCircle, Save } from "lucide-react";

export default function PaymentSettingsPage() {
  const [selectedGateways, setSelectedGateways] = useState(["CASHFREE"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/payment/admin/settings`);
      const data = await res.json();
      if (data && data.data && data.data.activeGateway) {
        const gw = data.data.activeGateway.toUpperCase();
        if (gw === "BOTH" || gw === "MULTIPLE") {
          setSelectedGateways(["CASHFREE", "ICICI"]);
        } else {
          setSelectedGateways(gw.split(",").map(g => g.trim()));
        }
      }
    } catch (err) {
      console.error("Error fetching gateway settings:", err);
      setError("Failed to load active payment gateway settings from server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGateway = (gateway) => {
    setSelectedGateways((prev) => {
      if (prev.includes(gateway)) {
        if (prev.length === 1) {
          setError("You must keep at least one payment gateway provider selected.");
          return prev;
        }
        setError("");
        return prev.filter((g) => g !== gateway);
      } else {
        setError("");
        return [...prev, gateway];
      }
    });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    let activeGateway = selectedGateways.join(",") || "CASHFREE";

    try {
      const res = await fetch(`${apiUrl}/payment/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeGateway }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const name = selectedGateways.length > 1 ? "Multiple Gateways (Customer selects preferred provider at checkout)" : (activeGateway === "ICICI" ? "ICICI Bank Gateway" : (activeGateway === "INSTAMOJO" ? "Instamojo" : "Cashfree Payments"));
        setSuccess(`Payment Gateway settings saved successfully! Now routing online checkout to: ${name}.`);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.message || "Failed to update payment gateway setting.");
      }
    } catch (err) {
      console.error("Error saving gateway settings:", err);
      setError("An error occurred while saving the configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[25rem]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#C8A64D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Loading Gateway Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-[#C8A64D]" />
          Payment Gateway Settings
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Choose which bank payment provider(s) handle live customer transactions. <strong>Select multiple gateways</strong> to let customers choose their preferred payment provider when clicking &quot;Pay Online&quot; at checkout.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r shadow-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r shadow-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Gateway Options Grid (Multi-Select) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cashfree Option */}
        <div
          onClick={() => toggleGateway("CASHFREE")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between ${
            selectedGateways.includes("CASHFREE")
              ? "border-[#C8A64D] bg-[#FDFBF7] shadow-lg ring-2 ring-[#C8A64D]/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md opacity-70"
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="p-3 bg-emerald-100/80 rounded-xl text-emerald-600">
                <Zap className="w-7 h-7" />
              </div>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                selectedGateways.includes("CASHFREE") ? "border-[#C8A64D] bg-[#C8A64D]" : "border-slate-300 bg-white"
              }`}>
                {selectedGateways.includes("CASHFREE") && <CheckCircle className="w-4 h-4 text-white" fill="#C8A64D" />}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-xl font-bold text-slate-800 mt-2 flex items-center gap-2">
                <span>Cashfree Payments</span>
                {selectedGateways.includes("CASHFREE") && (
                  <span className="text-[0.625rem] bg-[#C8A64D]/15 text-[#C8A64D] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Enabled
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Modern v3 Checkout Suite</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                <strong>All UPI Modes:</strong> Google Pay, PhonePe, Paytm
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Credit & Debit Cards + Netbanking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Seamless On-Site Window Checkout
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Direct Server-to-Server Verification
              </li>
            </ul>
          </div>
        </div>

        {/* ICICI Option */}
        <div
          onClick={() => toggleGateway("ICICI")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between ${
            selectedGateways.includes("ICICI")
              ? "border-[#C8A64D] bg-[#FDFBF7] shadow-lg ring-2 ring-[#C8A64D]/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md opacity-70"
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-100/80 rounded-xl text-blue-700">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                selectedGateways.includes("ICICI") ? "border-[#C8A64D] bg-[#C8A64D]" : "border-slate-300 bg-white"
              }`}>
                {selectedGateways.includes("ICICI") && <CheckCircle className="w-4 h-4 text-white" fill="#C8A64D" />}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-xl font-bold text-slate-800 mt-2 flex items-center gap-2">
                <span>ICICI Bank Gateway</span>
                {selectedGateways.includes("ICICI") && (
                  <span className="text-[0.625rem] bg-[#C8A64D]/15 text-[#C8A64D] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Enabled
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">ICICI Bank E-Commerce Portal</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Direct Corporate Bank Processing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                All Credit & Debit Cards (Visa / Mastercard)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Major Indian Bank Net Banking Support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Encrypted TranCtx Signature Validation
              </li>
            </ul>
          </div>
        </div>

        {/* Instamojo Option */}
        <div
          onClick={() => toggleGateway("INSTAMOJO")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between ${
            selectedGateways.includes("INSTAMOJO")
              ? "border-[#C8A64D] bg-[#FDFBF7] shadow-lg ring-2 ring-[#C8A64D]/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md opacity-70"
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="p-3 bg-purple-100/80 rounded-xl text-purple-700">
                <Zap className="w-7 h-7" />
              </div>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                selectedGateways.includes("INSTAMOJO") ? "border-[#C8A64D] bg-[#C8A64D]" : "border-slate-300 bg-white"
              }`}>
                {selectedGateways.includes("INSTAMOJO") && <CheckCircle className="w-4 h-4 text-white" fill="#C8A64D" />}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-xl font-bold text-slate-800 mt-2 flex items-center gap-2">
                <span>Instamojo</span>
                {selectedGateways.includes("INSTAMOJO") && (
                  <span className="text-[0.625rem] bg-[#C8A64D]/15 text-[#C8A64D] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Enabled
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Seamless Checkout Experience</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                All UPI Modes Support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Credit & Debit Cards + Netbanking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Highly Converting Interface
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A64D]" />
                Quick Processing
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#C8A64D] hover:bg-[#B5943E] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving Configuration..." : "Save Gateway Preference"}
        </button>
      </div>
    </div>
  );
}
