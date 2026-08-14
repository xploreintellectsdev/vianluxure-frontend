"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";

const TORN_EDGE_CLIP =
  "polygon(0% 0%, 100% 0%, 100% 88%, 96% 91%, 92% 87%, 88% 93%, 84% 89%, 80% 94%, 76% 88%, 72% 92%, 68% 86%, 64% 91%, 60% 87%, 56% 93%, 52% 88%, 48% 92%, 44% 86%, 40% 91%, 36% 87%, 32% 94%, 28% 88%, 24% 92%, 20% 86%, 16% 91%, 12% 87%, 8% 93%, 4% 88%, 0% 92%)";

const ThreadLine = () => (
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
);

function OverlayBanner({ banner }) {
  const content = (
    <section className="relative w-full h-[60vh] md:h-[80vh] min-h-[31.25rem] overflow-hidden bg-[#1c1a17] group cursor-pointer">
      <div className="absolute inset-0" style={{ clipPath: TORN_EDGE_CLIP }}>
        <img
          src={getImageUrl(banner.image)}
          alt={banner.title}
          className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
      </div>

      <ThreadLine />

      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
        {banner.eyebrow_label && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium"
          >
            {banner.eyebrow_label}
          </motion.span>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className="text-white text-6xl md:text-7xl lg:text-8xl font-serif font-semibold leading-[0.95] max-w-2xl"
        >
          {banner.title}
        </motion.h2>

        {banner.button_text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 flex items-center gap-2 w-fit"
          >
            <span className="text-white text-sm md:text-base font-semibold tracking-[0.15em] uppercase border-b border-white/70 pb-1 group-hover:border-white transition-colors">
              {banner.button_text}
            </span>
            <ArrowRight
              strokeWidth={2.5}
              size={18}
              className="text-white transform transition-transform duration-300 group-hover:translate-x-1"
            />
          </motion.div>
        )}
      </div>
    </section>
  );

  if (banner.button_link) {
    return (
      <Link href={banner.button_link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function SplitStatsBanner({ banner }) {
  return (
    <section className="relative w-full min-h-[37.5rem] overflow-hidden bg-[#1c1a17] group">
      <div className="absolute inset-0" style={{ clipPath: TORN_EDGE_CLIP }}>
        <img
          src={getImageUrl(banner.image)}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />
      </div>

      <ThreadLine />

      <div className="relative z-10 flex flex-col justify-center h-full min-h-[37.5rem] px-6 md:px-12 py-12 max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight leading-[0.95] mb-6 drop-shadow-lg"
        >
          {banner.title}
        </motion.h1>

        {banner.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-white/90 text-base md:text-lg font-mono max-w-xl mb-10 drop-shadow"
          >
            {banner.description}
          </motion.p>
        )}

        {banner.stats && banner.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 mb-10"
          >
            {banner.stats.map((stat, i) => (
              <div key={i}>
                <p className="text-white text-2xl md:text-3xl font-extrabold mb-1 drop-shadow">
                  {stat.stat_value}
                </p>
                <p className="text-white/85 text-sm font-mono">{stat.stat_label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {banner.button_text && banner.button_link && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          >
            <Link
              href={banner.button_link}
              className="group/cta flex items-center justify-center gap-3 w-full md:w-auto md:min-w-[21.875rem] py-4 px-8 bg-white/95 border-2 border-white text-black font-mono text-base md:text-lg tracking-wide hover:bg-black hover:text-white transition-colors duration-300"
            >
              {banner.button_text}
              <ArrowRight
                strokeWidth={2.5}
                size={20}
                className="transform transition-transform duration-300 group-hover/cta:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default function DynamicBanner({ bannerKey, banners = [] }) {
  if (!banners || !banners.length) return null;
  const banner = banners.find(b => b.banner_key === bannerKey);
  if (!banner) return null;

  if (banner.layout_type === 'split-stats') {
    return <SplitStatsBanner banner={banner} />;
  }

  return <OverlayBanner banner={banner} />;
}
