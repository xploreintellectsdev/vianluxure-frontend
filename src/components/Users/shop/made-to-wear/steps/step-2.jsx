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

function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function mapCollar(c) {
  return {
    id: c.option_id,
    name: c.option_name ?? "",
    image: resolveImageUrl(c.option_image),
    price: c.option_price ?? null,
    priceLabel: formatPrice(c.option_price),
  };
}

const CollarStep = ({ selectedId, onSelect }) => {
  const [collars, setCollars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCollars() {
      try {
        setLoading(true);
        setError(null);

        const res = await customStyleApi.getAll("collar", { limit: 100 });
        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];

        if (cancelled) return;
        setCollars(Array.isArray(raw) ? raw.map(mapCollar) : []);
      } catch (err) {
        console.error("Failed to fetch collars:", err);
        if (!cancelled) setError("Failed to load collars.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCollars();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#F5F3EF] border border-[#EBE8E2] rounded-2xl aspect-square animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-sm py-10">{error}</p>;
  }

  return (
    <StepPanel
      title="Choose Your Collar"
      subtitle="Handpicked, sustainable collar sourced with care."
      items={collars}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
};

export default CollarStep;