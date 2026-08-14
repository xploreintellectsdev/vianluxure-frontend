"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ShoppingBag, Lock, ChevronDown, FileText } from "lucide-react";
import Link from "next/link";
import MonogramSelector from "@/components/Users/shop/monogram/MonogramSelector";

const MEASUREMENT_LABELS = {
  neck: "Neck",
  leftWrist: "Left Wrist",
  rightWrist: "Right Wrist",
  shoulders: "Shoulders",
  lengthBack: "Length (Back)",
  sleeve: "Sleeve",
  biceps: "Biceps",
  chest: "Chest",
  hips: "Hips",
  waist: "Waist",
};

const BespokeBuildSummary = ({
  fabricName,
  fabricShortDescription,
  fabricLongDescription,
  selections,
  measurements,
  referenceFile,
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
      fabric.col_name && { label: "Colour", value: fabric.col_name },
      ...(Array.isArray(fabric.specifications)
        ? fabric.specifications.map((s) => ({
          label: s.spec_title,
          value: s.spec_value,
        }))
        : []),
    ].filter(Boolean)
    : [];

  const measurementRows = Object.entries(MEASUREMENT_LABELS)
    .map(([key, label]) => ({ label, value: measurements?.[key] }))
    .filter((row) => row.value);

  return (
    <div className="flex flex-col gap-6 flex-1 min-w-0 w-full pt-2">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[0.125rem] w-6 bg-[var(--primary-gold)]" />
          <p className="text-[var(--primary-gold)] uppercase tracking-[0.2em] text-[0.75rem] font-bold">
            Your Bespoke Design
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
            className={`flex items-center gap-4 px-6 py-4 ${i !== selections.length - 1 ? "border-b border-[#e0e0e0]" : ""
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

      {/* MEASUREMENTS */}
      <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] overflow-hidden shadow-sm w-full max-w-xl">
        <div className="px-6 py-4 border-b border-[#e0e0e0]">
          <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
            Your Measurements
          </p>
        </div>
        {measurementRows.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {measurementRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={
                    i !== measurementRows.length - 1 ? "border-b border-[#e0e0e0]" : ""
                  }
                >
                  <td className="px-6 py-3.5 text-[#888888] uppercase text-[0.6875rem] tracking-wider font-bold w-1/2">
                    {row.label}
                  </td>
                  <td className="px-6 py-3.5 text-[#161c24] font-semibold text-[0.875rem]">
                    {row.value}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-[#888888] px-6 py-6">
            No measurements provided.
          </p>
        )}
        {measurements?.notes && (
          <div className="px-6 py-4 border-t border-[#e0e0e0]">
            <p className="text-[0.625rem] font-bold tracking-widest text-[#888888] uppercase mb-1">
              Notes
            </p>
            <p className="text-sm text-[#161c24] leading-relaxed">{measurements.notes}</p>
          </div>
        )}
      </div>

      {/* REFERENCE FILE */}
      {referenceFile && (
        <div className="flex items-center gap-4 border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] px-6 py-5 shadow-sm w-full max-w-xl">
          <div className="relative w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0 ring-1 ring-[#e0e0e0] overflow-hidden">
            {referenceFile.previewUrl ? (
              <Image
                src={referenceFile.previewUrl}
                alt={referenceFile.name}
                fill
                unoptimized
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <FileText size={18} className="text-[var(--primary-gold)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-bold tracking-widest text-[#888888] uppercase mb-0.5">
              Reference File
            </p>
            <p className="text-sm font-semibold text-[#161c24] truncate">
              {referenceFile.name}
            </p>
          </div>
        </div>
      )}

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
          className="flex items-center justify-center gap-2 flex-1 border-2 border-[#e0e0e0] bg-transparent text-[#161c24] text-[0.875rem] font-bold uppercase tracking-wider px-5 py-4 rounded-full transition-all duration-300 hover:border-[var(--primary-gold)] hover:text-[var(--primary-gold)]"
        >
          <ChevronLeft size={16} strokeWidth={2.5} /> Change Design
        </button>
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center gap-2 flex-1 border-2 border-[var(--luxury-dark)] bg-transparent text-[#161c24] text-[0.875rem] font-bold uppercase tracking-wider px-5 py-4 rounded-full transition-all duration-300 hover:bg-[var(--luxury-dark)] hover:text-white"
        >
          <ShoppingBag size={16} strokeWidth={2.5} /> Add to Cart
        </button>
        <button
          onClick={onCheckout}
          className="flex items-center justify-center gap-2 flex-1 bg-[var(--primary-gold)] text-white text-[0.875rem] font-bold uppercase tracking-wider px-5 py-4 rounded-full shadow-lg shadow-[var(--primary-gold)]/20 transition-all duration-300 hover:bg-[var(--category-gold-hover)] hover:shadow-xl hover:-translate-y-0.5"
        >
          <Lock size={16} strokeWidth={2.5} /> Checkout
        </button>
      </div>

      {/* ABOUT THIS FABRIC — mobile/tablet only (below lg). On desktop/laptop
          (lg+) this is hidden here — it's shown instead in the left column
          under the fabric image (see BespokeCompleteBuild.jsx). Same pattern
          as Made to Wear. DO NOT remove "lg:hidden" — that keeps desktop correct. */}
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
              ? "bg-[var(--primary-gold)] border-[var(--primary-gold)] text-white shadow-md"
              : "bg-transparent border-[#e0e0e0] group-hover:border-[var(--primary-gold)] group-hover:text-[var(--primary-gold)] text-[#161c24]"
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
            <div className="pb-1 border-t border-[#e0e0e0]">
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
                            ? "border-b border-[#e0e0e0]"
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
              ? "bg-[var(--primary-gold)] border-[var(--primary-gold)] text-white shadow-md"
              : "bg-transparent border-[#e0e0e0] group-hover:border-[var(--primary-gold)] group-hover:text-[var(--primary-gold)] text-[#161c24]"
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
            <div className="px-6 pb-8 pt-5 space-y-6 text-[0.875rem] leading-relaxed border-t border-[#e0e0e0] text-[#555555]">
              <div>
                <p className="font-bold text-[0.9375rem] mb-2 text-[#161c24]">Shipping</p>
                <ul className="list-disc list-outside ml-4 space-y-1.5 marker:text-[var(--primary-gold)]">
                  <li>Delivery in 12–18 days for bespoke orders, given the custom tailoring involved.</li>
                  <li>OTP-based secure delivery — someone must be available to collect the parcel.</li>
                  <li>Address changes accepted only within 24 hours of placing the order.</li>
                  <li>International orders: customs duties and taxes are borne by the customer.</li>
                </ul>
                <Link
                  href="/policy/ShippingPolicy"
                  className="inline-block mt-3 text-[0.6875rem] font-bold uppercase tracking-widest text-[var(--primary-gold)] hover:text-[#161c24] transition-colors"
                >
                  View Full Shipping Policy →
                </Link>
              </div>

              <div>
                <p className="font-bold text-[0.9375rem] mb-2 text-[#161c24]">Returns &amp; Exchanges</p>
                <ul className="list-disc list-outside ml-4 space-y-1.5 marker:text-[var(--primary-gold)]">
                  <li>Free replacement for damaged or defective items — no extra cost.</li>
                  <li>Return requests must be raised from your account within 48 hours of delivery.</li>
                  <li>Refunds processed within 4–7 days after we receive the returned item.</li>
                  <li>Bespoke, made-to-measure products are not eligible for return or exchange.</li>
                </ul>
                <Link
                  href="/policy/CancellationAndRefunds"
                  className="inline-block mt-3 text-[0.6875rem] font-bold uppercase tracking-widest text-[var(--primary-gold)] hover:text-[#161c24] transition-colors"
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
                ? "bg-[var(--primary-gold)] border-[var(--primary-gold)] text-white shadow-md"
                : "bg-transparent border-[#e0e0e0] group-hover:border-[var(--primary-gold)] group-hover:text-[var(--primary-gold)] text-[#161c24]"
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
              <div className="px-6 pb-8 pt-5 space-y-6 text-[0.875rem] leading-relaxed border-t border-[#e0e0e0] text-[#555555] whitespace-pre-line">
                {fabric.fab_disclaimer}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BespokeBuildSummary;