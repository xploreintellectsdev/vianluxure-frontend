"use client";

import { useState, useEffect } from "react";
import { StepPanel } from "../../../../../sharables/steps/shared";
import { customStyleApi } from "@/api/customStyle.api";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function mapStyleOption(o) {
  return {
    id: o.option_id,
    name: o.option_name ?? "",
    image: resolveImageUrl(o.option_image),
    price: o.option_price ?? null,
    priceLabel: null, // Do not show price label for custom style accessories
  };
}

const DynamicStep = ({ slug, label, selectedId, onSelect }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError(null);
        const res = await customStyleApi.getAll(slug, { limit: 100 });
        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];
        if (cancelled) return;
        setItems(Array.isArray(raw) ? raw.map(mapStyleOption) : []);
      } catch (err) {
        console.error(`Failed to fetch ${slug}:`, err);
        if (!cancelled) setError(`Failed to load ${label}.`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (slug) {
        loadItems();
    }
    
    return () => { cancelled = true; };
  }, [slug, label]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#F5F3EF] border border-[#EBE8E2] rounded-2xl aspect-square animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-sm py-10">{error}</p>;
  }

  return (
    <StepPanel
      title={`Choose Your ${label}`}
      subtitle={`Select a ${label.toLowerCase()} style for your bespoke order.`}
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
};

export default DynamicStep;
