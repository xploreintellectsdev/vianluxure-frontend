"use client";

import { ArrowLeft } from "lucide-react";
import { SizeChartImage } from "../../../../../sharables/steps/shared";
import { FIT_STYLES, SIZE_OPTIONS } from "../data/madeToWearData";

const MeasurementStep = ({
  fitStyle,
  size,
  onFitStyleChange,
  onSizeChange,
  onZoom,
  onPrev,
  onSubmit,
}) => (
  <div>
    <div className="text-center mb-10">
      <h3
        className="text-3xl text-[#221F1E] mb-2 tracking-tight"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Find Your Measurement
      </h3>
      <p className="text-[#75716B] text-sm tracking-wide">
        Compare our Classic and Slim fits to find your perfect match.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#75716B] mb-2">
          Preferred Fit
        </label>
        <select
          value={fitStyle || ""}
          onChange={(e) => onFitStyleChange(e.target.value)}
          className="w-full bg-[#F5F3EF] border border-[#EBE8E2] rounded-xl px-4 py-3 text-[#221F1E] focus:outline-none focus:border-[#8C7355]"
        >
          <option value="">Choose Fit Style</option>
          {FIT_STYLES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#75716B] mb-2">
          Standard Size
        </label>
        <select
          value={size || ""}
          onChange={(e) => onSizeChange(e.target.value)}
          className="w-full bg-[#F5F3EF] border border-[#EBE8E2] rounded-xl px-4 py-3 text-[#221F1E] focus:outline-none focus:border-[#8C7355]"
        >
          <option value="">Select Size</option>
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>

    <p className="text-center text-xs font-bold uppercase tracking-widest text-[#8C7355] mb-6">
      Reference Size Charts
    </p>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <SizeChartImage
        title="Standard Size Table — Classic Fit"
        image="/images/sections/madetowear/fittable/standard-classic-sizes.jpg"
        onZoom={() =>
          onZoom("/images/sections/madetowear/fittable/standard-classic-sizes.jpg")
        }
      />
      <SizeChartImage
        title="Standard Size Table — Slim Fit"
        image="/images/sections/madetowear/fittable/standard-slim-sizes.jpg"
        onZoom={() =>
          onZoom("/images/sections/madetowear/fittable/standard-slim-sizes.jpg")
        }
      />
    </div>

    <div className="flex justify-center items-center gap-4 mt-10">
      {onPrev && (
        <button
          onClick={onPrev}
          className="flex items-center gap-2 bg-white text-[#221F1E] text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full border border-[#EBE8E2] hover:bg-[#F5F3EF] hover:border-[#8C7355]/40 transition-all active:scale-95"
        >
          <ArrowLeft size={14} /> Previous
        </button>
      )}
      <button
        onClick={onSubmit}
        disabled={!fitStyle || !size}
        className="bg-[#221F1E] text-white text-xs font-bold uppercase tracking-widest px-10 py-3.5 rounded-full hover:bg-[#8C7355] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#221F1E]/10 active:scale-95"
      >
        Complete Your Build
      </button>
    </div>
  </div>
);

export default MeasurementStep;