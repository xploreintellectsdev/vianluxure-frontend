"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuthContext } from "@/components/Users/context/AuthContext";
import { orderApi } from "@/api/order.api";

// ICICI redirects the customer's browser here after they complete (or
// abandon/fail) payment on the hosted page — see payment.controller.js's
// paymentCallback, which appends ?status=success|failed&orderNumber=...
// before issuing this redirect.
export default function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuthContext();
  const status = searchParams.get("status");
  const orderNumber = searchParams.get("orderNumber");
  const isSuccess = status === "success";

  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (isSuccess && orderNumber) {
      orderApi.getOrderDetailsByNumber(orderNumber)
        .then(res => {
          setOrderDetails(res.data?.data || res.data);
        })
        .catch(err => {
          console.error("Failed to fetch order details:", err);
        });
    }
  }, [isSuccess, orderNumber]);

  const isGuest = (!user && !isLoading) || Boolean(orderDetails?.isGuest);

  return (
    <div className="bg-[#FAFAF8] min-h-screen py-24 px-4 text-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-2xl border border-gray-200 shadow-xl">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isSuccess ? "bg-[#F5F0E1] text-[#C8A64D]" : "bg-red-50 text-red-500"
          }`}
        >
          {isSuccess ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
        </div>

        <h1 className="text-2xl font-serif tracking-widest mb-3">
          {isSuccess ? "( ORDER CONFIRMED )" : "( PAYMENT FAILED )"}
        </h1>

        <p className="text-gray-600 mb-1 text-sm leading-relaxed">
          {isSuccess
            ? "Thank you for your order — your payment was successful."
            : "Your payment could not be completed. No amount has been charged, or it will be refunded shortly if it was."}
        </p>

        {orderNumber && (
          <p className="text-sm text-gray-500 mb-6">
            Order Number: <span className="font-bold text-[#C8A64D]">{orderNumber}</span>
          </p>
        )}

        {isSuccess && isGuest && (
          <div className="bg-[#F5F0E1]/70 border border-[#C8A64D]/40 p-5 rounded-2xl mb-6 text-left shadow-sm">
            <h3 className="text-xs font-bold text-[#C8A64D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>★ Complete Your Registration</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              You checked out as a guest. Create an account with your saved order details to easily track this order and enjoy faster checkout in the future.
            </p>
            {orderDetails?.email && (
              <div className="bg-white/90 px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-700 font-mono">
                Saved Email: <span className="font-bold text-slate-900">{orderDetails.email}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3.5 mt-4">
          {!isSuccess && (
            <button
              onClick={() => router.push("/checkout/address")}
              className="w-full bg-[#C8A64D] text-white font-bold py-3.5 rounded-full hover:bg-[#b8974a] transition text-xs uppercase tracking-wider shadow-md"
            >
              TRY AGAIN
            </button>
          )}

          {isSuccess && isGuest ? (
            <>
              <button
                onClick={() => {
                  const query = new URLSearchParams();
                  if (orderDetails?.email) query.set("email", orderDetails.email);
                  if (orderDetails?.name) query.set("name", orderDetails.name);
                  if (orderDetails?.mobile) query.set("mobile", orderDetails.mobile);
                  if (orderNumber) query.set("orderNumber", orderNumber);
                  router.push(`/register?${query.toString()}`);
                }}
                className="w-full bg-[#C8A64D] text-white font-bold py-3.5 rounded-full hover:bg-[#b8974a] transition text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                COMPLETE REGISTRATION
              </button>
              <button
                onClick={() => router.push("/shop/fabric")}
                className="w-full border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold py-3.5 rounded-full transition text-xs uppercase tracking-wider cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/shop/fabric")}
              className={`w-full font-bold py-3.5 rounded-full transition text-xs uppercase tracking-wider cursor-pointer ${
                isSuccess
                  ? "bg-[#C8A64D] text-white hover:bg-[#b8974a] shadow-md"
                  : "border border-stone-300 text-stone-700 hover:bg-stone-100"
              }`}
            >
              CONTINUE SHOPPING
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
