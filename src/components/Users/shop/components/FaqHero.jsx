// src/components/common/HeroFAQ.jsx
"use client";
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function HeroFAQ({
  subtitle = "Frequently Asked Questions",
  title,
  footerText,
  faqs
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    // Seamless outer wrapper with zero padding
    <section className="w-full bg-page-bg">
      
      {/* FIXED: Reduced py-12 lg:py-20 down to py-8 lg:py-12 for a tighter vertical rhythm */}
      <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16 py-8 lg:py-12 font-sans">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">

          {/* Left Panel - Brand Dark Mode */}
          <div className="relative bg-[#161c24] rounded-[1.5rem] p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[26.25rem] lg:min-h-0 shadow-2xl shadow-[#161c24]/20">
            
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-[20rem] h-[20rem] bg-[#cba962]/20 rounded-full blur-[100px]" />
            <div className="pointer-events-none absolute -top-24 -left-24 w-[17.5rem] h-[17.5rem] bg-[#cba962]/10 rounded-full blur-[100px]" />

            {/* Grain-like subtle grid pattern for texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="h-[0.125rem] w-10 bg-[#cba962]" />
                <p className="text-[#cba962] uppercase tracking-[0.2em] text-[0.75rem] md:text-[0.8125rem] font-bold">
                  {subtitle}
                </p>
              </div>

              {/* Title */}
              <h2 className="text-[2.75rem] md:text-[3.375rem] lg:text-[4rem] font-serif font-bold leading-[1.05] tracking-tight text-white mb-6">
                {title}
              </h2>
            </div>

            <div className="relative z-10">
              <div className="border-t border-white/10 mb-6" />
              {footerText && (
                <p className="text-white/60 text-[0.875rem] md:text-[0.9375rem] leading-[1.7] max-w-sm font-medium">
                  {footerText}
                </p>
              )}
            </div>
          </div>

          {/* Right FAQ List */}
          <div className="flex flex-col justify-center lg:px-4 py-6 lg:py-0">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className={idx !== 0 ? 'border-t border-[#e0e0e0]' : ''}>
                  <button
                    onClick={() => toggleFAQ(idx)}
                    // FIXED: Reduced py-6 md:py-8 to py-5 md:py-6 to compact the list nicely
                    className="w-full flex items-center justify-between gap-6 py-5 md:py-6 text-left group"
                  >
                    {/* FAQ Question Text */}
                    <span
                      className={`text-[1.125rem] md:text-[1.25rem] font-medium leading-snug transition-colors duration-300 pr-4 ${
                        isOpen ? 'text-[#cba962]' : 'text-[#161c24] group-hover:text-[#cba962]'
                      }`}
                    >
                      {faq.question}
                    </span>
                    
                    {/* FAQ Toggle Icon */}
                    <span
                      className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${
                        isOpen
                          ? 'bg-[#cba962] border-[#cba962] text-white shadow-md'
                          : 'bg-transparent border-[#e0e0e0] group-hover:border-[#cba962] group-hover:text-[#cba962]'
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={18} strokeWidth={2} />
                      ) : (
                        <Plus 
                          size={18} 
                          strokeWidth={2} 
                          className="text-[#161c24] group-hover:text-[#cba962] transition-transform duration-500 group-hover:rotate-90" 
                        />
                      )}
                    </span>
                  </button>

                  {/* FAQ Answer */}
                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      {/* FIXED: Reduced pb-8 to pb-6 to match the tighter button padding */}
                      <p className="text-[#555555] text-[0.9375rem] md:text-[1rem] leading-[1.7] pb-6 pr-6 md:pr-12">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}