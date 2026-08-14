'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, Zap, History, MoveUpRight, MoveDownRight } from 'lucide-react';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeGatewaySetting, setActiveGatewaySetting] = useState("CASHFREE");
  const [selectedOnlineGateway, setSelectedOnlineGateway] = useState("CASHFREE");
  const [enabledGateways, setEnabledGateways] = useState(["CASHFREE"]);

  const fetchWalletData = async () => {
    try {
      const token = sessionStorage.getItem('vian_auth_token');
      if (!token) return;

      const [walletRes, txRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const walletData = await walletRes.json();
      const txData = await txRes.json();

      if (walletData.success) setWallet(walletData.data);
      if (txData.success) setTransactions(txData.data || []);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    const fetchGatewaySettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/payment/settings`);
        const data = await res.json();
        if (data && data.data && data.data.activeGateway) {
          const gw = data.data.activeGateway.toUpperCase();
          setActiveGatewaySetting(gw);
          
          let enabledList = [];
          if (gw === "BOTH" || gw === "MULTIPLE") {
            enabledList = ["CASHFREE", "ICICI"];
          } else {
            enabledList = gw.split(",").map(s => s.trim());
          }
          setEnabledGateways(enabledList);

          if (enabledList.includes("CASHFREE")) setSelectedOnlineGateway("CASHFREE");
          else if (enabledList.includes("ICICI")) setSelectedOnlineGateway("ICICI");
          else if (enabledList.includes("INSTAMOJO")) setSelectedOnlineGateway("INSTAMOJO");
        }
      } catch (err) {
        console.warn("Could not load gateway setting in wallet page:", err);
      }
    };
    fetchGatewaySettings();
  }, []);

  const handleAddMoney = async () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return alert('Enter a valid amount');

    try {
      const token = sessionStorage.getItem('vian_auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallets/add-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, gateway: selectedOnlineGateway })
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.gateway === "CASHFREE" && data.paymentSessionId) {
          if (!window.Cashfree) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
              script.onload = resolve;
              script.onerror = () => reject(new Error("Failed to load Cashfree checkout script."));
              document.head.appendChild(script);
            });
          }
          const cfMode = (data.env || process.env.NEXT_PUBLIC_CASHFREE_ENV || "SANDBOX").toUpperCase() === "PRODUCTION" ? "production" : "sandbox";
          const cashfree = window.Cashfree({ mode: cfMode });
          cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self"
          });
          return;
        } else if (data.gateway === "INSTAMOJO" && (data.checkoutUrl || data.paymentUrl)) {
          const url = data.checkoutUrl || data.paymentUrl;
          if (!window.Instamojo) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://js.instamojo.com/v1/checkout.js";
              script.onload = resolve;
              script.onerror = () => reject(new Error("Failed to load Instamojo checkout script."));
              document.head.appendChild(script);
            });
          }
          window.Instamojo.configure({
            handlers: {
              onOpen: function() {},
              onClose: function() { alert("Payment cancelled."); },
              onSuccess: function (response) {
                window.location.reload();
              },
              onFailure: function(response) {
                alert("Payment failed.");
              }
            }
          });
          window.Instamojo.open(url);
          return;
        } else if (data.paymentUrl || data.checkoutUrl) {
          window.location.href = data.paymentUrl || data.checkoutUrl;
        } else {
          alert('Recharge initiated, but no checkout session received.');
        }
      } else {
        alert(data.error || 'Failed to initiate recharge');
      }
    } catch (error) {
      console.error('Recharge error:', error);
      alert('Error initiating recharge');
    }
  };

  const fastAmounts = [500, 1000, 2000, 5000, 10000];

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading wallet...</div>;
  }

  return (
    <div className="w-full text-gray-900 bg-[#f8f9fc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 mt-10 md:mt-20">
        <div className="mb-8 pb-2">
          <h1 className="text-3xl font-serif tracking-widest text-[#C8A64D] mb-3 uppercase">My Wallet</h1>
          <p className="text-gray-500 text-sm">Recharge and manage your store wallet credit.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-white rounded-xl p-7 relative overflow-hidden shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs tracking-wider text-[#C8A64D] uppercase font-bold">Available Balance</span>
                <Wallet className="text-[#C8A64D]" size={18} />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₹ {Number(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 text-[0.625rem] text-emerald-600 font-bold tracking-wider uppercase">
                <ShieldCheck size={14} />
                <span>100% Secured Payment & Faster Checkout</span>
              </div>
            </div>

            {/* Recharge Card */}
            <div className="bg-white rounded-xl p-7 shadow-sm border border-gray-100">
              <h3 className="text-xs tracking-wider text-[#C8A64D] uppercase font-bold mb-3">Recharge Wallet</h3>
              <p className="text-gray-500 text-[0.6875rem] mb-6 leading-relaxed">Choose a fast amount or insert custom value below to add funds instantly.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-3">
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCustomAmount(amt.toString())}
                      className="py-2.5 rounded-lg border border-gray-200 bg-white hover:border-[#C8A64D] hover:text-[#C8A64D] text-gray-700 text-xs font-medium transition-all shadow-sm"
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => setCustomAmount('10000')}
                    className="col-span-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-[#C8A64D] hover:text-[#C8A64D] text-gray-700 text-xs font-medium transition-all shadow-sm"
                  >
                    ₹10000
                  </button>
                </div>

                <div>
                  <label className="block text-[0.625rem] text-gray-500 mb-2 font-bold uppercase tracking-wider">Custom Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-8 pr-4 text-gray-900 text-sm outline-none focus:border-[#C8A64D] focus:ring-1 focus:ring-[#C8A64D] transition-all placeholder:text-gray-400 shadow-sm"
                    />
                  </div>
                </div>

                {/* Gateway Provider Selection */}
                {enabledGateways.length > 1 && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <label className="block text-[0.625rem] text-gray-500 font-bold uppercase tracking-wider">Choose Payment Provider</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      
                      {enabledGateways.includes("CASHFREE") && (
                        <div
                          onClick={() => setSelectedOnlineGateway("CASHFREE")}
                          className={`cursor-pointer rounded-lg p-3 border-2 transition-all flex items-center justify-between ${
                            selectedOnlineGateway === "CASHFREE"
                              ? "border-[#C8A64D] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C8A64D]/20"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1 font-bold text-[0.6875rem] text-slate-800">
                              <Zap size={13} className="text-emerald-600" />
                              <span>Cashfree</span>
                            </div>
                            <p className="text-[0.5625rem] text-gray-500 mt-0.5">UPI, Cards &amp; Netbanking</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedOnlineGateway === "CASHFREE" ? "border-[#C8A64D] bg-[#C8A64D]" : "border-gray-300 bg-white"
                          }`}>
                            {selectedOnlineGateway === "CASHFREE" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      )}

                      {enabledGateways.includes("ICICI") && (
                        <div
                          onClick={() => setSelectedOnlineGateway("ICICI")}
                          className={`cursor-pointer rounded-lg p-3 border-2 transition-all flex items-center justify-between ${
                            selectedOnlineGateway === "ICICI"
                              ? "border-[#C8A64D] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C8A64D]/20"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1 font-bold text-[0.6875rem] text-slate-800">
                              <ShieldCheck size={13} className="text-blue-600" />
                              <span>ICICI Gateway</span>
                            </div>
                            <p className="text-[0.5625rem] text-gray-500 mt-0.5">ICICI E-Commerce</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedOnlineGateway === "ICICI" ? "border-[#C8A64D] bg-[#C8A64D]" : "border-gray-300 bg-white"
                          }`}>
                            {selectedOnlineGateway === "ICICI" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      )}

                      {enabledGateways.includes("INSTAMOJO") && (
                        <div
                          onClick={() => setSelectedOnlineGateway("INSTAMOJO")}
                          className={`cursor-pointer rounded-lg p-3 border-2 transition-all flex items-center justify-between ${
                            selectedOnlineGateway === "INSTAMOJO"
                              ? "border-[#C8A64D] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C8A64D]/20"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1 font-bold text-[0.6875rem] text-slate-800">
                              <Zap size={13} className="text-purple-600" />
                              <span>Instamojo</span>
                            </div>
                            <p className="text-[0.5625rem] text-gray-500 mt-0.5">Seamless Checkout</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedOnlineGateway === "INSTAMOJO" ? "border-[#C8A64D] bg-[#C8A64D]" : "border-gray-300 bg-white"
                          }`}>
                            {selectedOnlineGateway === "INSTAMOJO" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddMoney}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg bg-[#C8A64D] hover:bg-[#b8953c] active:scale-[0.98] text-white text-xs font-bold tracking-wider transition-all disabled:opacity-50 shadow-md"
                >
                  + ADD MONEY
                </button>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="bg-white rounded-xl p-7 shadow-sm border border-gray-100">
              <h3 className="text-xs tracking-wider text-[#C8A64D] uppercase font-bold mb-5 flex items-center gap-2">
                <Zap size={14} /> WALLET BENEFITS
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-50 p-1 text-emerald-500">
                    <MoveUpRight size={12} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Faster Checkout</h4>
                    <p className="text-[0.625rem] text-gray-500 mt-1">Skip the payment gateway for instant orders.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-50 p-1 text-emerald-500">
                    <MoveDownRight size={12} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Instant Refunds</h4>
                    <p className="text-[0.625rem] text-gray-500 mt-1">Cancellations are credited back immediately.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[31.25rem]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-xs tracking-wider text-[#C8A64D] uppercase font-bold">
                <History size={16} /> WALLET TRANSACTIONS
              </div>
              <div className="text-[0.625rem] tracking-wider text-gray-400 font-medium uppercase">{transactions.length} RECORDS</div>
            </div>
            
            <div className="overflow-auto flex-1 p-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-wider bg-gray-50 rounded-md">
                    <th className="py-3 px-4 font-semibold rounded-l-md w-32">Date</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right rounded-r-md">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(tx => {
                    const isCredit = tx.transaction_type === 'CREDIT';
                    return (
                      <tr key={tx.transaction_id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-4 text-gray-500 text-[0.6875rem] font-medium">
                          {new Date(tx.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-800">{tx.transaction_source}</div>
                          {tx.order_id && <div className="text-[0.625rem] text-gray-400 mt-0.5">Order: {tx.order_id}</div>}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {isCredit ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-[0.5625rem] uppercase font-bold tracking-wider text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {tx.transaction_status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-800 font-bold">
                          ₹{Number(tx.balance_after).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
                  <div className="text-xs font-medium">No transactions found</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}