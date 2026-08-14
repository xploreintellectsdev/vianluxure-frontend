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

function mapPocket(p) {
  return {
    id: p.option_id,
    name: p.option_name ?? "",
    image: resolveImageUrl(p.option_image),
    price: p.option_price ?? null,
    priceLabel: formatPrice(p.option_price),
  };
}

const PocketStep = ({ selectedId, onSelect }) => {
  const [pockets, setPockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPockets() {
      try {
        setLoading(true);
        setError(null);

        const res = await customStyleApi.getAll("pocket", { limit: 100 });
        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];

        if (cancelled) return;
        setPockets(Array.isArray(raw) ? raw.map(mapPocket) : []);
      } catch (err) {
        console.error("Failed to fetch pockets:", err);
        if (!cancelled) setError("Failed to load pockets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPockets();
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
      title="Choose Your Pocket"
      subtitle="Handpicked, sustainable pocket sourced with care."
      items={pockets}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
};

export default PocketStep;