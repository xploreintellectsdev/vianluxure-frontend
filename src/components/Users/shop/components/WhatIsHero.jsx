// src/components/common/WhatIsHero.jsx
"use client";
import React from 'react';

export default function WhatIsHero({ subtitle, title, description, features }) {
  return (
    // Zero outer padding so it stays flush with other components
    <section className="w-full bg-page-bg">

      {/* FIXED: Reduced py-12 lg:py-16 to py-8 lg:py-10 for tighter vertical rhythm */}
      <div className="mx-auto w-full max-w-[87.5rem] px-[clamp(1.5rem,4vw,5rem)] py-8 lg:py-10 font-sans">

        {/* Centered Header */}
        {/* FIXED: Reduced mb-12 md:mb-16 to mb-8 md:mb-10 to pull the grid up */}
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-10">
          {subtitle && (
            <span className="inline-flex items-center gap-4 text-category-gold uppercase tracking-[0.2em] text-[0.75rem] md:text-[0.8125rem] font-bold mb-4">
              <span className="w-8 h-[0.125rem] bg-category-gold"></span>
              {subtitle}
              <span className="w-8 h-[0.125rem] bg-category-gold"></span>
            </span>
          )}

          <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-serif font-bold text-text-primary leading-[1.1] tracking-tight mb-4">
            {title}
          </h2>

          {description && (
            <p className="text-text-primary/70 text-[0.9375rem] md:text-[1rem] font-medium leading-[1.7]">
              {description}
            </p>
          )}
        </div>

        {/* Feature Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                // FIXED: Changed `items-start` to `items-center text-center` to place icons and text in the middle
                className="group flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-white/80 border border-text-border/15 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-white hover:border-category-gold/40 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1"
              >
                {Icon && (
                  <div
                    className="flex items-center justify-center mb-5 rounded-2xl bg-category-gold/10 text-category-gold transition-all duration-500 group-hover:bg-category-gold group-hover:text-white"
                    style={{ width: '3.25rem', height: '3.25rem' }}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                )}

                <h3 className="text-[1.25rem] font-serif font-bold text-text-primary mb-3 leading-tight">
                  {feature.title}
                </h3>

                <p className="text-text-primary/60 text-[0.95rem] leading-[1.65] font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}