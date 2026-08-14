"use client";

import { useState, useEffect, useMemo } from "react";
import { OptionGrid } from "../../../../../sharables/steps/shared";
import { fabricApi } from "@/api/fabric.api";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  const formatted = num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  return `${formatted}`;
}

// Normalizes a fabric_master row (as returned by findAllFabrics, which
// joins fabric_categories as fc_name) into the { id, name, category, image, price, priceLabel }
// shape this step's OptionGrid renders.
function mapFabric(f) {
  return {
    id: f.fab_id,
    name: f.fab_name ?? "",
    category: f.fc_name ?? "Uncategorized",
    image: resolveImageUrl(f.fab_cover_image),
    price: f.fab_price_per_meter ?? null,
    gst: f.fab_gst ? parseFloat(f.fab_gst) : 0,
    stitching_charges: f.fab_stitching_charges ? parseFloat(f.fab_stitching_charges) : 0,
    priceLabel: formatPrice(f.fab_price_per_meter),
  };
}

const FabricStep = ({
  selectedId,
  onSelect,
  activeFabricCategory,
  setActiveFabricCategory,
}) => {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFabrics() {
      try {
        setLoading(true);
        setError(null);

        const res = await fabricApi.getAll({ limit: 100 });
        const raw = res?.data?.data ?? res?.data?.fabrics ?? res?.data ?? [];

        if (cancelled) return;
        setFabrics(Array.isArray(raw) ? raw.map(mapFabric) : []);
      } catch (err) {
        console.error("Failed to fetch fabrics:", err);
        if (!cancelled) setError("Failed to load fabrics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFabrics();
    return () => {
      cancelled = true;
    };
  }, []);

  const fabricCategories = useMemo(() => {
    return ["All", ...new Set(fabrics.map((f) => f.category))];
  }, [fabrics]);

  const filteredFabrics = useMemo(() => {
    if (activeFabricCategory === "All") return fabrics;
    return fabrics.filter((f) => f.category === activeFabricCategory);
  }, [activeFabricCategory, fabrics]);

  return (
    <div>
      {/* Heading */}
      <div className="text-center mb-10">
        <h3
          className="text-3xl text-foreground mb-2 tracking-tight"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Choose Your Fabric
        </h3>
        <p className="text-body text-sm tracking-wide">
          Handpicked, sustainable fabrics sourced with care.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {fabricCategories.map((cat) => {
          const count =
            cat === "All"
              ? fabrics.length
              : fabrics.filter((f) => f.category === cat).length;
          const isActive = activeFabricCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFabricCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-[var(--luxury-dark)] text-white shadow-md shadow-black/15"
                  : "bg-page-bg border border-text-border text-text-muted hover:border-[var(--primary-gold)]/40 hover:text-foreground"
              }`}
            >
              {cat}
              <span
                className={`text-[0.625rem] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-section-bg text-text-subtle"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-section-bg border border-text-border rounded-2xl aspect-square animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-500 text-sm py-10">{error}</p>
      ) : filteredFabrics.length === 0 ? (
        <p className="text-center text-text-subtle text-sm py-10">
          No fabrics found in this category.
        </p>
      ) : (
        <OptionGrid
          items={filteredFabrics}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default FabricStep;