"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Same signature treatment as FabricBanner for brand consistency across
// the shop banners: torn edge via clip-path + a stitched thread line.

const TORN_EDGE_CLIP =
  "polygon(0% 0%, 100% 0%, 100% 88%, 96% 91%, 92% 87%, 88% 93%, 84% 89%, 80% 94%, 76% 88%, 72% 92%, 68% 86%, 64% 91%, 60% 87%, 56% 93%, 52% 88%, 48% 92%, 44% 86%, 40% 91%, 36% 87%, 32% 94%, 28% 88%, 24% 92%, 20% 86%, 16% 91%, 12% 87%, 8% 93%, 4% 88%, 0% 92%)";

export default function ReadyToWearBanner() {
  return (
    <Link href="/shop/ready-to-wear" className="block">
      <section className="relative w-full h-[60vh] md:h-[80vh] min-h-[31.25rem] overflow-hidden bg-[#1c1a17] group cursor-pointer">
        {/* ================= IMAGE, TORN AT THE BOTTOM EDGE ================= */}
        <div
          className="absolute inset-0"
          style={{ clipPath: TORN_EDGE_CLIP }}
        >
          <img
            src="/images/banners/ready-to-wear-banner.webp"
            alt="Ready to Wear"
            className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
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

        {/* ================= CONTENT — set directly on the image, no frame ================= */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium"
          >
            Made to Move
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="text-white text-6xl md:text-7xl lg:text-8xl font-serif font-semibold leading-[0.95] max-w-2xl"
          >
            Ready to Wear
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 flex items-center gap-2 w-fit"
          >
            <span className="text-white text-sm md:text-base font-semibold tracking-[0.15em] uppercase border-b border-white/70 pb-1 group-hover:border-white transition-colors">
              Shop Collection
            </span>
            <ArrowRight
              strokeWidth={2.5}
              size={18}
              className="text-white transform transition-transform duration-300 group-hover:translate-x-1"
            />
          </motion.div>
        </div>
      </section>
    </Link>
  );
}