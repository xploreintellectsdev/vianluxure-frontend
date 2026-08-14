"use client";

import Image from "next/image";
import { Check } from "lucide-react";

export const OptionGrid = ({ items, selectedId, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item)}
        className={`bg-section-bg rounded-2xl p-3 flex flex-col gap-3 text-left transition-all ${
          selectedId === item.id
            ? "ring-2 ring-[var(--primary-gold)]"
            : "hover:ring-1 hover:ring-text-border"
        }`}
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white">
          <Image
            src={item.image}
            alt={item.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2"
          />
          {selectedId === item.id && (
            <span className="absolute top-2 right-2 w-6 h-6 bg-[var(--primary-gold)] rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          {item.priceLabel && (
            <p className="text-sm text-[var(--primary-gold)] font-bold mt-1">
              {item.priceLabel}
            </p>
          )}
        </div>
      </button>
    ))}
  </div>
);

export const StepPanel = ({ title, subtitle, items, selectedId, onSelect }) => (
  <div>
    <div className="text-center mb-10">
      <h3
        className="text-3xl text-foreground mb-2 tracking-tight"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        {title}
      </h3>
      <p className="text-body text-sm tracking-wide">{subtitle}</p>
    </div>
    <OptionGrid items={items} selectedId={selectedId} onSelect={onSelect} />
  </div>
);

export const SizeChartImage = ({ title, image, onZoom }) => (
  <div>
    <p className="text-center font-bold text-foreground text-xs uppercase tracking-widest mb-3">
      {title}
    </p>
    <button
      onClick={onZoom}
      className="relative w-full rounded-xl overflow-hidden border border-text-border hover:border-[var(--primary-gold)] transition-all group"
    >
      <Image
        src={image}
        alt={title}
        width={900}
        height={600}
        className="w-full h-auto object-contain"
      />
      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="bg-white/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full">
          Click to enlarge
        </span>
      </span>
    </button>
  </div>
);