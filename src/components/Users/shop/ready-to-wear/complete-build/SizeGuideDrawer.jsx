"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { sizeGuideData, availableSizes } from "@/components/Users/shop/ready-to-wear/complete-build/SizeGuidedata";

// Maps display sizes to the numeric keys in sizeGuideData (neck-based sizing)
const SIZE_MAP = {
  XS: 37, S: 38, M: 39, L: 40, XL: 41, "2XL": 42,
  "3XL": 43, "4XL": 44, "5XL": 45, "6XL": 46,
};

const displaySizes = Object.keys(SIZE_MAP);

// Row labels matching the reference: A. Collar, B. Chest, C. Midsection, D. Full Sleeve, E. Half Sleeve, F. Shoulder
const guideRows = [
  { code: "A", key: "neck", label: "Collar Size" },
  { code: "B", key: "chest", label: "Chest" },
  { code: "C", key: "waist", label: "Midsection" },
  { code: "D", key: "sleeveLength", label: "Full Sleeve Length" },
  { code: "E", key: "biceps", label: "Half Sleeve Length" },
  { code: "F", key: "shoulders", label: "Shoulder" },
];

export default function SizeSelectPanel({ isOpen, onClose, onAddToBag, onSaveSize }) {
  const [activeFit, setActiveFit] = useState("Slim");
  const [activeSize, setActiveSize] = useState("XS");
  const [unit, setUnit] = useState("cm");

  const fits = ["Slim", "Regular", "Relaxed"];
  const fitKey = activeFit === "Slim" ? "slim" : "classic"; // Regular/Relaxed fall back to classic data
  const numericSize = SIZE_MAP[activeSize];
  const row = sizeGuideData[fitKey]?.[numericSize];

  const cmToIn = (val) => (val / 2.54).toFixed(1);
  const fmt = (val) => (val == null ? "-" : `${unit === "cm" ? val.toFixed(1) : cmToIn(val)} ${unit}`);

  const neckDisplay = row ? fmt(row.neck) : "-";
  const chestDisplay = row ? fmt(row.chest) : "-";

  return (
    <>
      {/* Invisible click-catcher to close on outside click — no dark/blur overlay */}
      {/* Navbar header uses z-[99999] with `isolate`, and its CartDrawer uses z-[100000]/[100001] —
          match that pattern here so this drawer also renders above the navbar */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100000] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-[100001] h-full w-full sm:max-w-xl bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-[#E7D6A3] shrink-0">
          <h2 className="text-2xl font-serif font-semibold text-[#5C4A1E]">Select a size</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#5C4A1E] hover:opacity-70 transition-opacity"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Fit selection */}
          <div className="px-6 sm:px-8 pt-6 pb-6">
            <p className="text-sm mb-3 text-[#5C4A1E]">
              <span className="font-bold">Fit:</span> {activeFit}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {fits.map((fit) => (
                <button
                  key={fit}
                  onClick={() => setActiveFit(fit)}
                  className={`py-4 text-sm font-semibold border rounded-lg transition-all ${
                    activeFit === fit
                      ? "border-[#C8A64D] bg-[#FBF3DD] text-[#5C4A1E]"
                      : "border-[#E7D6A3] bg-gray-50 text-[#8A7A4F] hover:border-[#C8A64D]"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Size selection */}
          <div className="px-6 sm:px-8 pb-6">
            <p className="text-sm mb-3 text-[#5C4A1E]">
              <span className="font-bold">Size:</span> {activeSize} - {neckDisplay} Neck / {chestDisplay} Chest
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {displaySizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(size)}
                  className={`py-4 text-sm font-semibold border rounded-lg transition-all ${
                    activeSize === size
                      ? "border-[#C8A64D] bg-[#FBF3DD] text-[#5C4A1E]"
                      : "border-[#E7D6A3] bg-gray-50 text-[#8A7A4F] hover:border-[#C8A64D]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Size Guide */}
          <div className="border-t border-[#E7D6A3] pt-6 pb-8 px-6 sm:px-8">
            <h3 className="text-center text-xl font-serif font-semibold text-[#5C4A1E] mb-5">
              Size Guide
            </h3>

            {/* Table - full width */}
            <div className="w-full border border-[#E7D6A3] rounded-lg overflow-hidden bg-[#FFFDF6]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FBF3DD]">
                    <th className="px-4 py-3 text-xs font-semibold text-[#5C4A1E] border-b border-[#E7D6A3]">
                      <button
                        onClick={() => setUnit(unit === "cm" ? "in" : "cm")}
                        className="underline decoration-2 underline-offset-2 decoration-[#C8A64D]"
                      >
                        {unit}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#5C4A1E] border-b border-[#E7D6A3]">
                      {activeSize}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guideRows.map(({ code, key, label }, idx) => (
                    <tr key={key} className={idx % 2 === 0 ? "bg-transparent" : "bg-[#FBF3DD]/50"}>
                      <td className="px-4 py-3 text-xs text-[#5C4A1E] whitespace-nowrap">
                        {code}. {label}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#5C4A1E] whitespace-nowrap">
                        {row ? fmt(row[key]) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E7D6A3] p-4 sm:p-6 bg-white shrink-0">
          <p className="text-center text-sm font-semibold text-[#5C4A1E] mb-3">
            Size: {activeSize}  Fit: {activeFit}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSaveSize?.({ size: activeSize, fit: activeFit })}
              className="flex-1 py-4 rounded-lg border border-[#C8A64D] text-[#5C4A1E] font-bold text-sm hover:bg-[#FBF3DD] transition-colors"
            >
              Save Size
            </button>
            <button
              onClick={() => onAddToBag?.({ size: activeSize, fit: activeFit })}
              className="flex-1 py-4 rounded-lg bg-[#C8A64D] text-white font-bold text-sm hover:bg-[#B08F3E] transition-colors"
            >
              Add to bag
            </button>
          </div>
        </div>
      </div>
    </>
  );
}