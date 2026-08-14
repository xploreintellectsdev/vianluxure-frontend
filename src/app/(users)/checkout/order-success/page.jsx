"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ListOrdered, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const qOrderNum = searchParams ? searchParams.get("orderNumber") : null;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!qOrderNum) {
      setError("No order number provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/details/${qOrderNum}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setDetails(data.data || data);
        } else {
          setError(data.message || "Failed to load order confirmation details.");
        }
      } catch (err) {
        console.error("❌ Error loading success details:", err);
        setError("A network error occurred. Please check your orders page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [qOrderNum]);

  return (
    <div className="max-w-md w-full bg-[#0b1726] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#C8A64D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#C8A64D] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-300">Loading order details...</p>
        </div>
      ) : error ? (
        <div className="py-6">
          <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl uppercase tracking-wider text-white mb-3">
            Order Confirmed
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-light mb-8 max-w-xs mx-auto">
            {error}
          </p>
          <div className="space-y-3">
            <Link
              href="/profile"
              className="w-full h-11 bg-[#C8A64D] hover:bg-[#b8974a] text-white text-[0.6875rem] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
              <span>View My Orders</span>
            </Link>
            <Link
              href="/shop"
              className="w-full h-11 bg-transparent hover:bg-white/5 border border-white/10 text-white text-[0.6875rem] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-300" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mx-auto w-20 h-20 bg-[#C8A64D]/10 border border-[#C8A64D]/20 rounded-full flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-[#C8A64D]/5 rounded-full animate-ping opacity-30" />
            <CheckCircle className="w-10 h-10 text-[#C8A64D] stroke-[1.5]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-normal uppercase tracking-wider text-white mb-3 leading-tight">
            Order Successfully Placed
          </h2>
          
          <p className="text-sm text-slate-300 leading-relaxed font-light mb-6 max-w-xs mx-auto">
            Thank you for choosing Vian Luxure. Your order has been registered, and confirmation has been dispatched.
          </p>

          <div className="bg-[#070e17] rounded-xl border border-white/5 p-5 mb-8 text-left space-y-3 font-mono text-xs text-slate-300 select-none">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="uppercase text-[0.5625rem] tracking-wider text-slate-400">Order Number</span>
              <span className="text-white font-bold">{details?.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="uppercase text-[0.5625rem] tracking-wider text-slate-400">Payment Status</span>
              <span className="text-emerald-400 font-bold uppercase">{details?.paymentStatus}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="uppercase text-[0.5625rem] tracking-wider text-slate-400">Payment Method</span>
              <span className="text-white font-semibold uppercase">{details?.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="uppercase text-[0.5625rem] tracking-wider text-slate-400">Amount Paid</span>
              <span className="text-[#C8A64D] font-bold">₹{details?.amountPaid}/-</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="uppercase text-[0.5625rem] tracking-wider text-slate-400">Expected Delivery</span>
              <span className="text-white font-semibold">{details?.expectedDelivery}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/shop"
              className="w-full h-11 bg-[#C8A64D] hover:bg-[#b8974a] text-white text-[0.6875rem] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <Link
              href="/profile"
              className="w-full h-11 bg-transparent hover:bg-white/5 border border-white/10 text-white text-[0.6875rem] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ListOrdered className="w-4 h-4 text-slate-300" />
              <span>View My Orders</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="relative min-h-screen bg-[#070e17] pt-28 md:pt-36 pb-16 px-6 sm:px-12 lg:px-16 overflow-hidden flex flex-col justify-start">
      <div className="fixed inset-0 bg-[#030c17]/75 backdrop-blur-[4px] flex items-center justify-center z-50 p-4 animate-fade-in">
        <Suspense fallback={
          <div className="max-w-md w-full bg-[#0b1726] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#C8A64D] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-slate-300">Loading order details...</p>
            </div>
          </div>
        }>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
