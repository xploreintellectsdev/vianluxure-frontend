"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { ACCORDION_ITEMS } from "@/components/Users/shop/made-to-wear/complete-build/completeBuildData";

/**
 * ProductAccordion
 * "Fabric & Care" + "Shipping & Returns" panels, rendered by the parent
 * page directly beneath the "About This Fabric" card in the left column —
 * this component owns both accordions' open/close state independently.
 *
 * `fabric` — fabric detail object, fetched once by the parent
 * (CompleteBuild.jsx) and passed down here. Avoids a duplicate
 * fetchById call for the same fabricId.
 * `fabricLoading` — loading state for that same parent-level fetch.
 *
 * Confirmed field mapping from a real fabric_master API response:
 * fc_name, wt_name, wv_name, pat_name, col_name.
 */
const CompleteBuildDetails = ({ fabric, fabricLoading }) => {
  const [openSection, setOpenSection] = useState(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const fabricSpecRows = fabric
    ? [
      fabric.fc_name && { label: "Category", value: fabric.fc_name },
      fabric.wt_name && { label: "Weight", value: fabric.wt_name },
      fabric.wv_name && { label: "Weave", value: fabric.wv_name },
      fabric.pat_name && { label: "Pattern", value: fabric.pat_name },
      fabric.col_name && { label: "Colour", value: fabric.col_name },
    ].filter(Boolean)
    : [];

  return (
    <div>
      {/* FABRIC & CARE */}
      {ACCORDION_ITEMS.filter((item) => item.key === "fabric").map((item) => {
        const isOpen = openSection === item.key;
        return (
          <div
            key={item.key}
            className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm mt-5"
          >
            <button
              onClick={() => toggleSection(item.key)}
              className="w-full flex items-center justify-between px-6 py-5 group transition-colors hover:bg-[#fbf9f4]"
            >
              <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
                {item.label}
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
        );
      })}

      {/* SHIPPING & RETURNS */}
      <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm mt-5">
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
        <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-white overflow-hidden shadow-sm mt-5">
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

export default CompleteBuildDetails;