"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Same signature treatment as the shop banners (ReadyToWearBanner /
// MadeToWearBanner) for brand consistency: torn edge via clip-path + a
// stitched thread line.

const TORN_EDGE_CLIP =
  "polygon(0% 0%, 100% 0%, 100% 88%, 96% 91%, 92% 87%, 88% 93%, 84% 89%, 80% 94%, 76% 88%, 72% 92%, 68% 86%, 64% 91%, 60% 87%, 56% 93%, 52% 88%, 48% 92%, 44% 86%, 40% 91%, 36% 87%, 32% 94%, 28% 88%, 24% 92%, 20% 86%, 16% 91%, 12% 87%, 8% 93%, 4% 88%, 0% 92%)";

export default function BespokeHero() {
  const stats = [
    { value: "10,000+", label: "Custom-Made Garments" },
    { value: "90%+", label: "★★★★★ Reviews" },
    { value: "137K+", label: "Followers and Growing" },
    { value: "Low", label: "Cost per Wear" },
    { value: "Low", label: "Environmental Footprint" },
  ];

  return (
    <section className="relative w-full min-h-[37.5rem] overflow-hidden bg-[#1c1a17] group">
      {/* ================= IMAGE, TORN AT THE BOTTOM EDGE ================= */}
      <div
        className="absolute inset-0"
        style={{ clipPath: TORN_EDGE_CLIP }}
      >
        <img
          src="/images/banners/bespoke-banner.webp"
          alt="Bespoke Tailoring"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />
      </div>

      {/* Thread line tracing the tear — the signature detail */}
      <svg
        className="absolute left-0 w-full"
        style={{ bottom: "8%", height: "14%" }}
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,4 3,4.5 4,7.5 8,6.5 12,7.8 16,6.2 20,7.8 24,6.5 28,8 32,5.8 36,7.8 40,6 44,7.8 48,6.2 52,7.8 56,6 60,7.8 64,6.2 68,7.8 72,6 76,8 80,5.8 84,8 88,6.5 92,7.8 96,6.5 100,7.2"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.35"
          strokeDasharray="1.2 1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>

      {/* ================= CONTENT (left aligned, on top of image) ================= */}
      <div className="relative z-10 flex flex-col justify-center h-full min-h-[37.5rem] px-6 md:px-12 py-12 max-w-2xl">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight leading-[0.95] mb-6 drop-shadow-lg"
        >
          Tired of settling for off-the-rack fits?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-white/90 text-base md:text-lg font-mono max-w-xl mb-10 drop-shadow"
        >
          We don't fit you into pre-made moulds. Every Bespoke piece is built
          from your measurements, your fabric, your fit.
        </motion.p>

        {/* ================= STATS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 mb-10"
        >
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-white text-2xl md:text-3xl font-extrabold mb-1 drop-shadow">
                {stat.value}
              </p>
              <p className="text-white/85 text-sm font-mono">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ================= CTA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
        >
          <a
            href="/shop/bespoke"
            className="group/cta flex items-center justify-center gap-3 w-full md:w-auto md:min-w-[21.875rem] py-4 px-8 bg-white/95 border-2 border-white text-black font-mono text-base md:text-lg tracking-wide hover:bg-black hover:text-white transition-colors duration-300"
          >
            Create My Bespoke
            <ArrowRight
              strokeWidth={2.5}
              size={20}
              className="transform transition-transform duration-300 group-hover/cta:translate-x-1"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}