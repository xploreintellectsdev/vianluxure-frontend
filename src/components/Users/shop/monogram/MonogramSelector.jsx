"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Sparkles, Circle } from 'lucide-react';
import { monogramApi } from '@/api/monogram.api';
import showToast from '@/sharables/toast';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function MonogramSelector({ value = null, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [colors, setColors] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer selection state
  const [selectedPlacement, setSelectedPlacement] = useState("none"); // "none" or placement object
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFont, setSelectedFont] = useState(null);
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setLoading(true);
        try {
          const [pRes, cRes, fRes] = await Promise.all([
            monogramApi.getPublicPlacements(),
            monogramApi.getPublicColors(),
            monogramApi.getPublicFonts()
          ]);
          const pData = pRes.data || [];
          const cData = cRes.data || [];
          const fData = fRes.data || [];

          setPlacements(pData);
          setColors(cData);
          setFonts(fData);

          // Restore from existing value if any
          if (value && value.enabled) {
            setInitials(value.initials || "");
            const pMatch = pData.find(p => p.placement_id === value.placementId) || "none";
            const cMatch = cData.find(c => c.color_id === value.colorId) || cData[0] || null;
            const fMatch = fData.find(f => f.font_id === value.fontId) || fData[0] || null;
            setSelectedPlacement(pMatch);
            setSelectedColor(cMatch);
            setSelectedFont(fMatch);
          } else {
            setInitials("");
            setSelectedPlacement("none");
            setSelectedColor(cData[0] || null);
            setSelectedFont(fData[0] || null);
          }
        } catch (err) {
          showToast.error("Failed to load monogram options");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen, value]);

  const handleSave = () => {
    if (selectedPlacement === "none") {
      onChange(null);
      setIsOpen(false);
      return;
    }
    if (!initials.trim()) {
      showToast.error("Please enter monogram text or initials");
      return;
    }
    if (!selectedColor || !selectedFont) {
      showToast.error("Please select both a thread color and font style");
      return;
    }

    const price = Number(selectedPlacement.extra_price) || 0;
    const monogramData = {
      enabled: true,
      initials: initials.trim().toUpperCase(),
      placementId: selectedPlacement.placement_id,
      placementName: selectedPlacement.placement_name,
      colorId: selectedColor.color_id,
      colorName: selectedColor.color_name,
      fontId: selectedFont.font_id,
      fontName: selectedFont.font_name,
      price: price,
      text: `${initials.trim().toUpperCase()} (Placement: ${selectedPlacement.placement_name}, Color: ${selectedColor.color_name}, Font: ${selectedFont.font_name})`
    };

    onChange(monogramData);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const currentPrice = selectedPlacement && selectedPlacement !== "none" ? Number(selectedPlacement.extra_price) || 0 : 0;

  return (
    <div className={`w-full ${className}`}>
      {value && value.enabled ? (
        /* SELECTED STATE TRIGGER CARD */
        <div className="border border-[#cba962]/60 rounded-[1.25rem] bg-[#fdfbf7] p-5 shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#cba962]/10 rounded-full pointer-events-none" />
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#cba962]" />
                <span className="text-[0.6875rem] font-bold tracking-widest text-[#161c24] uppercase">
                  Custom Monogram Added
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#cba962]/20 text-[#8A7A4F] font-bold text-[0.6875rem]">
                  +₹{value.price.toFixed(2)}
                </span>
              </div>
              <div className="text-xl font-serif font-bold text-[#161c24] tracking-widest uppercase">
                &ldquo;{value.initials}&rdquo;
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666666]">
                <div><span className="font-semibold text-[#161c24]">Placement:</span> {value.placementName}</div>
                <div><span className="font-semibold text-[#161c24]">Color:</span> {value.colorName}</div>
                <div><span className="font-semibold text-[#161c24]">Font:</span> {value.fontName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-2.5 text-[#666666] hover:text-[#161c24] bg-white border border-[#e0e0e0] rounded-xl transition-colors hover:border-[#cba962] shadow-sm"
                title="Edit Monogram"
              >
                <Edit2 size={15} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2.5 text-red-500 hover:text-red-700 bg-white border border-[#e0e0e0] rounded-xl transition-colors hover:border-red-300 shadow-sm"
                title="Remove Monogram"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* UNSELECTED TRIGGER CARD */
        <div className="border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] p-5 shadow-sm hover:border-[#cba962]/60 transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#cba962]" />
                <span className="text-[0.75rem] font-bold tracking-widest text-[#161c24] uppercase">
                  Personalize with Monogram
                </span>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed">
                Add initials embroidered on collar, cuff, or chest to make your garment truly exclusive.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="shrink-0 bg-[#161c24] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#cba962] transition-all duration-300 flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} strokeWidth={2.5} /> Add Monogram
            </button>
          </div>
        </div>
      )}

      {/* BACKDROP OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[100000] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* RIGHT SIDEBAR DRAWER (Gold & White Luxury Theme) */}
      <div
        className={`fixed top-0 right-0 z-[100001] h-full w-full sm:w-[30rem] md:w-[31.25rem] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* DRAWER HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7D6A3]/60 shrink-0 bg-white">
          <h2 className="text-xl font-serif font-bold tracking-[0.15em] text-[#C8A64D] uppercase">
            Monogram
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#5C4A1E] hover:bg-[#FBF3DD]/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* DRAWER SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white">
          {loading ? (
            <div className="py-24 text-center text-[#8A7A4F] text-sm font-medium animate-pulse">
              Loading monogram options...
            </div>
          ) : (
            <>
              {/* SECTION 1: PLACEMENT CARDS */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {/* "None" Option Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlacement("none")}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all duration-200 aspect-[4/4.2] ${
                      selectedPlacement === "none"
                        ? "border-[#C8A64D] bg-[#FBF3DD]/40 text-[#5C4A1E] ring-1 ring-[#C8A64D]"
                        : "border-[#e0e0e0] bg-[#FAFAFA] text-[#777777] hover:border-[#C8A64D]/60"
                    }`}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-dashed border-[#cccccc] flex items-center justify-center text-[0.625rem] uppercase font-bold text-[#888888]">
                        None
                      </div>
                    </div>
                    <div>
                      <span className="block font-bold text-xs uppercase tracking-wider mb-0.5">None</span>
                      <span className="text-[0.625rem] text-[#8A7A4F] font-semibold">Free</span>
                    </div>
                  </button>

                  {/* Dynamic Placement Cards from API */}
                  {placements.map((item) => {
                    const isSelected = selectedPlacement !== "none" && selectedPlacement?.placement_id === item.placement_id;
                    return (
                      <button
                        key={item.placement_id}
                        type="button"
                        onClick={() => setSelectedPlacement(item)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all duration-200 aspect-[4/4.2] ${
                          isSelected
                            ? "border-[#C8A64D] bg-[#FBF3DD]/40 text-[#5C4A1E] ring-1 ring-[#C8A64D]"
                            : "border-[#e0e0e0] bg-[#FAFAFA] text-[#444444] hover:border-[#C8A64D]/60"
                        }`}
                      >
                        <div className="w-full h-14 rounded-lg overflow-hidden flex items-center justify-center mb-1 bg-white border border-[#eeeeee]">
                          {item.placement_image ? (
                            <img src={resolveImageUrl(item.placement_image)} alt={item.placement_name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-xs font-bold text-[#888888]">{item.placement_name.slice(0, 3)}</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs uppercase tracking-wider mb-0.5 truncate max-w-[5.625rem]">{item.placement_name}</span>
                          <span className="text-[0.6875rem] text-[#C8A64D] font-bold">+₹{Number(item.extra_price).toFixed(2)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: TEXT INPUT (Only prominent when a placement other than "None" is chosen) */}
              <div className={`space-y-2 transition-opacity duration-200 ${selectedPlacement === "none" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#5C4A1E]">
                    TEXT <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[0.6875rem] font-bold tracking-widest text-[#8A7A4F]">
                    {initials.length} {initials.length === 1 ? "character" : "characters"}
                  </span>
                </div>
                <input
                  type="text"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  placeholder="ENTER MONOGRAM TEXT OR INITIALS"
                  disabled={selectedPlacement === "none"}
                  className="w-full bg-[#FAFAFA] border border-[#E7D6A3]/80 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-[0.25em] uppercase text-[#161c24] placeholder-[#aaaaaa] focus:outline-none focus:border-[#C8A64D] focus:bg-white focus:ring-1 focus:ring-[#C8A64D]"
                />
                <p className="text-[0.6875rem] text-[#888888] leading-relaxed italic">
                  The monogram will be embroidered exactly as entered.
                </p>
              </div>

              {/* SECTION 3: COLOR SWATCHES */}
              <div className={`space-y-3 pt-2 transition-opacity duration-200 ${selectedPlacement === "none" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                <span className="block text-xs font-bold uppercase tracking-widest text-[#5C4A1E]">
                  COLOR
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {colors.length === 0 ? (
                    <p className="text-xs text-[#888888] col-span-2">No thread colors available.</p>
                  ) : (
                    colors.map((color) => {
                      const isSelected = selectedColor?.color_id === color.color_id;
                      return (
                        <div
                          key={color.color_id}
                          onClick={() => selectedPlacement !== "none" && setSelectedColor(color)}
                          className="flex items-start gap-3 cursor-pointer group select-none"
                        >
                          <div className="mt-1 shrink-0">
                            {isSelected ? (
                              <span className="w-5 h-5 bg-[#C8A64D] rounded-full flex items-center justify-center text-white shadow-sm">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            ) : (
                              <Circle size={20} className="text-[#cccccc] group-hover:text-[#C8A64D]" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className={`w-24 h-9 rounded-md border overflow-hidden shadow-inner bg-[#f0f0f0] transition-all ${
                              isSelected ? "border-[#C8A64D] ring-1 ring-[#C8A64D]" : "border-[#dddddd] group-hover:border-[#C8A64D]/60"
                            }`}>
                              {color.color_image && (
                                <img src={resolveImageUrl(color.color_image)} alt={color.color_name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="text-xs font-semibold text-[#444444] tracking-wide mt-0.5 truncate">
                              {color.color_name}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SECTION 4: FONT STYLES */}
              <div className={`space-y-3 pt-2 transition-opacity duration-200 ${selectedPlacement === "none" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                <span className="block text-xs font-bold uppercase tracking-widest text-[#5C4A1E]">
                  FONT
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {fonts.length === 0 ? (
                    <p className="text-xs text-[#888888] col-span-2">No fonts available.</p>
                  ) : (
                    fonts.map((font) => {
                      const isSelected = selectedFont?.font_id === font.font_id;
                      return (
                        <div
                          key={font.font_id}
                          onClick={() => selectedPlacement !== "none" && setSelectedFont(font)}
                          className="flex items-start gap-3 cursor-pointer group select-none"
                        >
                          <div className="mt-2 shrink-0">
                            {isSelected ? (
                              <span className="w-5 h-5 bg-[#C8A64D] rounded-full flex items-center justify-center text-white shadow-sm">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            ) : (
                              <Circle size={20} className="text-[#cccccc] group-hover:text-[#C8A64D]" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className={`w-32 h-11 px-3 py-1 bg-white rounded-md border flex items-center justify-center shadow-sm transition-all ${
                              isSelected ? "border-[#C8A64D] bg-[#FBF3DD]/20 ring-1 ring-[#C8A64D]" : "border-[#e0e0e0] group-hover:border-[#C8A64D]/60"
                            }`}>
                              {font.font_preview_image ? (
                                <img src={resolveImageUrl(font.font_preview_image)} alt={font.font_name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <span className="text-lg font-serif italic text-[#333333]">Abc</span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-[#444444] tracking-wide mt-0.5 truncate">
                              {font.font_name}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* DRAWER FOOTER / ACTION BUTTON */}
        <div className="p-6 border-t border-[#E7D6A3]/60 bg-white shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#161c24] text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#C8A64D] transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {selectedPlacement === "none" ? (
              "SAVE (FREE / NO MONOGRAM)"
            ) : (
              `SAVE (+₹${currentPrice.toFixed(2)})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
