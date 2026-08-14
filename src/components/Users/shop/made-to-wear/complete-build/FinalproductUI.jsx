"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ShoppingBag, Lock, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import MonogramSelector from "@/components/Users/shop/monogram/MonogramSelector";

const CompleteBuildSummary = ({
  fabricName,
  fabricShortDescription,
  fabricLongDescription,
  selections,
  fitStyle,
  size,
  total,
  fabric,
  fabricLoading,
  monogram,
  onMonogramChange,
  onChangeDesign,
  onAddToCart,
  onCheckout,
}) => {
  const [specsOpen, setSpecsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const fabricSpecRows = fabric
    ? [
      fabric.fc_name && { label: "Category", value: fabric.fc_name },
      fabric.wt_name && { label: "Weight", value: fabric.wt_name },
      fabric.wv_name && { label: "Weave", value: fabric.wv_name },
      fabric.pat_name && { label: "Pattern", value: fabric.pat_name },
      // fabric.col_name && { label: "Colour", value: fabric.col_name },
      ...(Array.isArray(fabric.specifications)
        ? fabric.specifications.map((s) => ({
          label: s.spec_title,
          value: s.spec_value,
        }))
        : []),
    ].filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-6 flex-1 min-w-0 w-full pt-2">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[0.125rem] w-6 bg-[#cba962]" />
          <p className="text-[#cba962] uppercase tracking-[0.2em] text-[0.75rem] font-bold">
            Your Made to Wear Design
          </p>
        </div>
        <h1 className="font-serif text-[2rem] md:text-[2.75rem] text-[#161c24] font-bold leading-[1.1] tracking-tight mb-3">
          {fabricName}
        </h1>
        {fabricShortDescription && (
          <p className="text-[#555555] text-[0.9375rem] leading-[1.7] max-w-xl">
            {fabricShortDescription}
          </p>
        )}
      </div>

      {/* DESIGN SELECTIONS */}
      <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] overflow-hidden shadow-sm w-full max-w-xl">
        <div className="px-6 py-4 border-b border-[#e0e0e0]">
          <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
            Design Selections
          </p>
        </div>
        {selections.map((sel, i) => (
          <div
            key={sel.key}
            className={`flex items-center gap-4 px-6 py-4 ${i !== selections.length - 1 ? "border-b border-[#eeeeee]" : ""
              }`}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 ring-1 ring-[#e0e0e0]">
              {sel.value?.image && (
                <Image
                  src={sel.value.image}
                  alt={sel.value.name}
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-contain p-1.5"
                />
              )}
            </div>
            <div>
              <p className="text-[0.625rem] font-bold tracking-widest text-[#888888] uppercase mb-0.5">
                {sel.label}
              </p>
              <p className="text-sm font-semibold text-[#161c24]">
                {sel.value?.name || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SIZE & FIT */}
      <div className="flex items-center gap-4 border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] px-6 py-5 shadow-sm w-full max-w-xl">
        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0 ring-1 ring-[#e0e0e0]">
          <span className="w-5 h-5 rounded-sm border-2 border-[#cba962]" />
        </div>
        <div>
          <p className="text-[0.625rem] font-bold tracking-widest text-[#888888] uppercase mb-0.5">
            Size &amp; Fit
          </p>
          <p className="text-sm font-semibold text-[#161c24]">
            {fitStyle} — Size {size}
          </p>
        </div>
      </div>

      {/* MONOGRAM SELECTOR */}
      <MonogramSelector
        value={monogram}
        onChange={onMonogramChange}
        className="max-w-xl"
      />

      {/* TOTAL */}
      <div className="flex items-center justify-between border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] px-6 py-6 w-full max-w-xl shadow-sm">
        <div>
          <p className="text-[0.625rem] font-bold tracking-widest text-[#888888] uppercase mb-1">
            Total
          </p>
          <p className="text-[1.75rem] font-serif text-[#161c24]">₹{total}</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-[#888888]">Includes all customisations</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
        <button
          onClick={onChangeDesign}
          className="flex items-center justify-center gap-2 flex-1 border-2 border-[#e0e0e0] bg-transparent text-[#161c24] text-[0.875rem] font-bold uppercase tracking-wider px-5 py-4 rounded-full transition-all duration-300 hover:border-[#cba962] hover:text-[#cba962]"
        >
          <ChevronLeft size={16} strokeWidth={2.5} /> Change Design
        </button>
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center gap-2 flex-1 border-2 border-[#161c24] bg-transparent text-[#161c24] text-[0.875rem] font-bold uppercase tracking-wider px-5 py-4 rounded-full transition-all duration-300 hover:bg-[#161c24] hover:text-white"
        >
          <ShoppingBag size={16} strokeWidth={2.5} /> Add to Cart
        </button>
        <button
          onClick={onCheckout}
          className="flex items-center justify-center gap-2 flex-1 bg-[#cba962] text-white text-[0.875rem] font-bold uppercase tracking-wider px-5 py-4 rounded-full shadow-lg shadow-[#cba962]/20 transition-all duration-300 hover:bg-[#b59555] hover:shadow-xl hover:-translate-y-0.5"
        >
          <Lock size={16} strokeWidth={2.5} /> Checkout
        </button>
      </div>

      {/* ABOUT THIS FABRIC — mobile/tablet only (below lg). Placed right
          below the action buttons to match the fabric product page pattern.
          On desktop/laptop (lg+) this is hidden here — it's shown instead
          in the left column under the fabric image (see CompleteBuild.jsx).
          DO NOT remove "lg:hidden" — that's what keeps desktop correct. */}
      {(fabricLoading || fabricLongDescription) && (
        <div className="lg:hidden border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] p-6 shadow-sm w-full max-w-xl">
          <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase mb-3">
            About This Fabric
          </p>
          {fabricLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-white/70 rounded w-full" />
              <div className="h-3 bg-white/70 rounded w-5/6" />
            </div>
          ) : (
            <p className="text-[#555555] text-[0.9375rem] leading-[1.7]">
              {fabricLongDescription}
            </p>
          )}
        </div>
      )}

      {/* FABRIC SPECS & CARE */}
      <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm w-full max-w-xl">
        <button
          onClick={() => setSpecsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-5 group transition-colors hover:bg-[#fbf9f4]"
        >
          <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
            Fabric Specs &amp; Care
          </span>
          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${specsOpen
              ? "bg-[#cba962] border-[#cba962] text-white shadow-md"
              : "bg-transparent border-[#e0e0e0] group-hover:border-[#cba962] group-hover:text-[#cba962] text-[#161c24]"
              }`}
          >
            <ChevronDown
              size={16}
              strokeWidth={2.5}
              className={`transition-transform duration-500 ${specsOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        <div
          className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${specsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="pb-1 border-t border-[#eeeeee]">
              {fabricLoading ? (
                <div className="space-y-2 p-6 animate-pulse">
                  <div className="h-3 bg-[#fbf9f4] rounded w-full" />
                  <div className="h-3 bg-[#fbf9f4] rounded w-full" />
                  <div className="h-3 bg-[#fbf9f4] rounded w-2/3" />
                </div>
              ) : fabricSpecRows.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {fabricSpecRows.map((s, i) => (
                      <tr
                        key={s.label}
                        className={
                          i !== fabricSpecRows.length - 1
                            ? "border-b border-[#eeeeee]"
                            : ""
                        }
                      >
                        <td className="px-6 py-4 text-[#888888] uppercase text-[0.6875rem] tracking-wider font-bold w-1/3 whitespace-nowrap">
                          {s.label}
                        </td>
                        <td className="px-6 py-4 text-[#161c24] font-semibold text-[0.875rem]">
                          {s.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-[#888888] px-6 pb-6 pt-4">
                  No specifications available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SHIPPING & RETURNS */}
      <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm w-full max-w-xl">
        <button
          onClick={() => setShippingOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-5 group transition-colors hover:bg-[#fbf9f4]"
        >
          <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
            Shipping &amp; Returns
          </span>
          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${shippingOpen
              ? "bg-[#cba962] border-[#cba962] text-white shadow-md"
              : "bg-transparent border-[#e0e0e0] group-hover:border-[#cba962] group-hover:text-[#cba962] text-[#161c24]"
              }`}
          >
            <ChevronDown
              size={16}
              strokeWidth={2.5}
              className={`transition-transform duration-500 ${shippingOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        <div
          className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${shippingOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="px-6 pb-8 pt-5 space-y-6 text-[0.875rem] leading-relaxed border-t border-[#eeeeee] text-[#555555]">
              <div>
                <p className="font-bold text-[0.9375rem] mb-2 text-[#161c24]">Shipping</p>
                <ul className="list-disc list-outside ml-4 space-y-1.5 marker:text-[#cba962]">
                  <li>Delivery in 7–10 days for metro cities, 10–15 days for other locations.</li>
                  <li>OTP-based secure delivery — someone must be available to collect the parcel.</li>
                  <li>Address changes accepted only within 24 hours of placing the order.</li>
                  <li>International orders: customs duties and taxes are borne by the customer.</li>
                </ul>
                <Link
                  href="/policy/ShippingPolicy"
                  className="inline-block mt-3 text-[0.6875rem] font-bold uppercase tracking-widest text-[#cba962] hover:text-[#161c24] transition-colors"
                >
                  View Full Shipping Policy →
                </Link>
              </div>

              <div>
                <p className="font-bold text-[0.9375rem] mb-2 text-[#161c24]">Returns &amp; Exchanges</p>
                <ul className="list-disc list-outside ml-4 space-y-1.5 marker:text-[#cba962]">
                  <li>Free replacement for damaged or defective items — no extra cost.</li>
                  <li>Return requests must be raised from your account within 48 hours of delivery.</li>
                  <li>Refunds processed within 4–7 days after we receive the returned item.</li>
                  <li>Customized or made-to-order products are not eligible for return or exchange.</li>
                </ul>
                <Link
                  href="/policy/CancellationAndRefunds"
                  className="inline-block mt-3 text-[0.6875rem] font-bold uppercase tracking-widest text-[#cba962] hover:text-[#161c24] transition-colors"
                >
                  View Full Return &amp; Exchange Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      {fabric?.fab_disclaimer && (
        <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm w-full max-w-xl">
          <button
            onClick={() => setDisclaimerOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-5 group transition-colors hover:bg-[#fbf9f4]"
          >
            <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
              Disclaimer
            </span>
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${disclaimerOpen
                ? "bg-[#cba962] border-[#cba962] text-white shadow-md"
                : "bg-transparent border-[#e0e0e0] group-hover:border-[#cba962] group-hover:text-[#cba962] text-[#161c24]"
                }`}
            >
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`transition-transform duration-500 ${disclaimerOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          <div
            className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${disclaimerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-8 pt-5 space-y-6 text-[0.875rem] leading-relaxed border-t border-[#eeeeee] text-[#555555] whitespace-pre-line">
                {fabric.fab_disclaimer}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteBuildSummary;