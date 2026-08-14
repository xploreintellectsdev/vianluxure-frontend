"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// ── Read More / Read Less truncation ──
export function ReadMoreText({ text, wordLimit = 350, className = "" }) {
  const [expanded, setExpanded] = useState(false);

  const { truncated, isTruncated } = useMemo(() => {
    if (!text) return { truncated: "", isTruncated: false };
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return { truncated: text, isTruncated: false };
    }
    return { truncated: words.slice(0, wordLimit).join(" ") + "…", isTruncated: true };
  }, [text, wordLimit]);

  if (!text) return null;

  return (
    <div className={className}>
      <p className="whitespace-pre-line">{expanded ? text : truncated}</p>
      {isTruncated && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-[0.6875rem] font-bold uppercase tracking-widest text-[#cba962] hover:text-[#161c24] transition-colors"
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

// ── ABOUT FABRIC BLOCK ──
export const AboutFabric = ({ product }) =>
  product?.longDescription ? (
    <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] p-6 shadow-sm w-full">
      <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase mb-3">
        About This Fabric
      </p>
      <p className="text-[#555555] text-[0.9375rem] leading-[1.7]">
        {product.longDescription}
      </p>
    </div>
  ) : null;

// ── SPECS & CARE ACCORDION ──
export const SpecsSection = ({ product, specsOpen, setSpecsOpen }) => {
  if (!product?.specs?.length) return null;

  return (
    <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm mt-5">
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
          <div className="border-t border-[#eeeeee]">
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((s, i) => (
                  <tr
                    key={s.label}
                    className={
                      i !== product.specs.length - 1
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
          </div>
        </div>
      </div>
    </div>
  );
};

// ── SHIPPING & RETURNS ACCORDION ──
export const ShippingReturnsSection = ({ isOpen, onToggle }) => {
  return (
    <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm mt-5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 group transition-colors hover:bg-[#fbf9f4]"
      >
        <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
          Shipping &amp; Returns
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${isOpen
            ? "bg-[#cba962] border-[#cba962] text-white shadow-md"
            : "bg-transparent border-[#e0e0e0] group-hover:border-[#cba962] group-hover:text-[#cba962] text-[#161c24]"
            }`}
        >
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className={`transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
  );
};

// ── DISCLAIMER ACCORDION ──
export const DisclaimerSection = ({ product, isOpen, onToggle }) => {
  if (!product?.disclaimer) return null;

  return (
    <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm mt-5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 group transition-colors hover:bg-[#fbf9f4]"
      >
        <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
          Disclaimer
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${isOpen
            ? "bg-[#cba962] border-[#cba962] text-white shadow-md"
            : "bg-transparent border-[#e0e0e0] group-hover:border-[#cba962] group-hover:text-[#cba962] text-[#161c24]"
            }`}
        >
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className={`transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-8 pt-5 space-y-6 text-[0.875rem] leading-relaxed border-t border-[#eeeeee] text-[#555555] whitespace-pre-line">
            {product.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};