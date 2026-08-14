// src/components/common/HeroReviewStories.jsx
"use client";
import React from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';

export default function HeroReviewStories({ 
  title = "Customer Stories", 
  reviews, 
  imageSrc, 
  imageAlt 
}) {
  return (
    // Solid background. Zero outer padding so it sits perfectly flush.
    <section className="w-full bg-page-bg">
      
      {/* FIXED: Applied tight py-8 lg:py-12 here to unify the rhythm with other sections */}
      <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16 py-8 lg:py-12 font-sans">
        
        {/* Adjusted gap to match tight layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">

          {/* Left Content (Reviews) */}
          <div className="flex flex-col justify-center xl:pr-8">
            
            {/* Title - FIXED: Reduced mb-10 to mb-8 for a tighter look */}
            <h2 className="text-[2.75rem] md:text-[3.375rem] lg:text-[3.75rem] font-serif font-bold text-[#161c24] leading-[1.1] mb-8 tracking-tight">
              {title}
            </h2>

            {/* Subtle, elegant dividers */}
            <div className="flex flex-col divide-y divide-[#eeeeee]">
              {reviews.map((review, idx) => (
                // FIXED: Reduced py-6 to py-5 and added 'group' to trigger hover effects
                <div key={idx} className="group flex items-start gap-5 py-5 first:pt-0 last:pb-0">
                  
                  {/* Avatar Icon - Re-added the luxury gold border hover transition */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#fbf9f4] border border-[#f0ede6] flex items-center justify-center overflow-hidden mt-1 transition-colors duration-500 group-hover:border-[#cba962]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-[#cba962]/60 transition-colors duration-500 group-hover:text-[#cba962]"
                    >
                      <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9V22h19.6v-2.7c0-3.3-6.5-4.9-9.8-4.9z" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      
                      {/* Customer Name */}
                      <h3 className="text-[1rem] md:text-[1.0625rem] font-bold text-[#161c24]">
                        {review.name}
                      </h3>
                      
                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-[#cba962] fill-[#cba962]' : 'text-[#e0e0e0]'}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Date */}
                    <p className="text-[#999999] text-[0.75rem] uppercase tracking-wider font-semibold mb-2.5">
                      {review.date}
                    </p>
                    
                    {/* Review Text */}
                    <p className="text-[#555555] text-[0.9375rem] leading-[1.7] max-w-[95%]">
                      {review.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Container */}
          {/* FIXED: Removed mb-12 to fix mobile spacing glitch, re-added Vogue hover effects */}
          <div className="group relative w-full h-full min-h-[25rem] lg:min-h-full rounded-[1.5rem] overflow-hidden bg-[#fbf9f4] shadow-2xl shadow-[#161c24]/10">
            <Image
              src={imageSrc}
              alt={imageAlt || "Customer Review Image"}
              fill
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw" 
            />
            
            {/* Dark gradient base - fades in on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            {/* Inner border micro-interaction */}
            <div className="absolute inset-5 border border-white/50 rounded-[1rem] pointer-events-none opacity-0 scale-95 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100" />
          </div>

        </div>
      </div>
    </section>
  );
}