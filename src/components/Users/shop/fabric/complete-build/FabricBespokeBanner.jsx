"use client";

import Image from "next/image";
import Link from "next/link";

export default function FabricBespokeBanner({
  href = "/shop/bespoke",
  highlightText = "Fit for",
  regularText = "Body & Soul",
}) {
  return (
    <Link
      href={href}
      className="group relative block w-full h-[17.5rem] md:h-[21.875rem] lg:h-[26.25rem] overflow-hidden rounded-2xl border-4 border-white"
    >
      {/* Background image */}
      <Image
        src="/images/be-spoke-bg/bespoke-bg.png"
        alt="Bespoke fabric background"
        fill
        priority
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-16">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight flex flex-wrap items-center">
          <span className="bg-[#C8A64D] text-[#2F4A3C] px-3 py-1 mr-2 rounded-lg">
            {highlightText}
          </span>
          <span className="text-[#FAFAF8]">{regularText}</span>
        </h2>
      </div>
    </Link>
  );
}