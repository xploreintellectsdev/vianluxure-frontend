// src/components/common/WhyChooseSection.jsx
"use client";
import React from 'react';

export default function WhyChooseSection({
  imageSrc,
  imageAlt,
  subtitle,
  title,
  description,
  features,
}) {
  return (
    // Pure, solid background. No outer padding so it sits flush.
    <section className="w-full bg-page-bg">
      
      {/* FIXED: Completely removed the "Ambient backdrop" div that caused the visible split/seam */}

      {/* Inner wrapper defines layout */}
      <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16 font-sans">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-8 lg:py-12">

          {/* Left Image - Interactive luxury hover states */}
          <div className="relative w-full rounded-[1.5rem] overflow-hidden group shadow-2xl shadow-[#161c24]/10">
            <img
              src={imageSrc}
              alt={imageAlt || title}
              className="w-full h-auto object-cover aspect-[4/3] lg:aspect-[1.15/1] transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Dark gradient base - fades in on hover to make the border pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            {/* The inner border - smoothly scales and fades in on hover */}
            <div className="absolute inset-5 border border-white/50 rounded-[1rem] pointer-events-none opacity-0 scale-95 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100" />
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-center lg:pl-6">
            
            {/* Subtitle */}
            {subtitle && (
              <div className="flex items-center gap-4 mb-5">
                <span className="h-[0.125rem] w-10 bg-[#cba962]" />
                <p className="text-[#cba962] uppercase tracking-[0.2em] text-[0.75rem] md:text-[0.8125rem] font-bold">
                  {subtitle}
                </p>
              </div>
            )}

            {/* Title */}
            <h2 className="text-[2.75rem] md:text-[3.375rem] lg:text-[3.75rem] font-serif font-bold text-[#161c24] leading-[1.05] tracking-tight mb-6">
              {title}
            </h2>

            {/* Description */}
            {description && (
              <p className="text-[#555555] text-[0.9375rem] md:text-[1rem] font-normal leading-[1.7] mb-10 max-w-[95%]">
                {description}
              </p>
            )}

            {/* Features Checkmark List */}
            <div className="flex flex-col gap-2">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-4 p-4 -mx-4 rounded-2xl transition-colors duration-300 hover:bg-[#fbf9f4]"
                >
                  {/* Checkmark icon */}
                  <span className="flex-shrink-0 w-[1.625rem] h-[1.625rem] rounded-full bg-transparent border border-[#e0e0e0] flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:border-[#cba962] group-hover:bg-[#cba962]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 text-[#cba962] transition-colors duration-300 group-hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  
                  <p className="text-[#444444] text-[0.9375rem] md:text-[1rem] leading-[1.6]">
                    <span className="font-semibold text-[#161c24]">{item.title}:</span>{' '}
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}