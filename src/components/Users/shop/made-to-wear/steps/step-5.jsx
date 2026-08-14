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

function mapSleeve(s) {
  return {
    id: s.option_id,
    name: s.option_name ?? "",
    image: resolveImageUrl(s.option_image),
    price: s.option_price ?? null,
    priceLabel: formatPrice(s.option_price),
  };
}

const SleeveStep = ({ selectedId, onSelect }) => {
  const [sleeves, setSleeves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSleeves() {
      try {
        setLoading(true);
        setError(null);

        const res = await customStyleApi.getAll("sleeve", { limit: 100 });
        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];

        if (cancelled) return;
        setSleeves(Array.isArray(raw) ? raw.map(mapSleeve) : []);
      } catch (err) {
        console.error("Failed to fetch sleeves:", err);
        if (!cancelled) setError("Failed to load sleeves.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSleeves();
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
      title="Choose Your Sleeve"
      subtitle="Handpicked, sustainable sleeve sourced with care."
      items={sleeves}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
};

export default SleeveStep;