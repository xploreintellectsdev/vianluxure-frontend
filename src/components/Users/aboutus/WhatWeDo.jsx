"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

const WhatWeDo = ({ intro, bespoke }) => {
  if (!intro && !bespoke) return null;

  return (
    <section className="py-6 px-6 md:px-10 lg:px-16 w-full">
      {/* Header */}
      {intro && (
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide text-slate-700 mb-4 uppercase">
            {intro.title}
          </h2>
          <div 
            className="text-slate-700 max-w-3xl leading-relaxed text-lg md:text-xl"
            dangerouslySetInnerHTML={{ __html: intro.description }}
          />
        </div>
      )}

      {/* Bespoke heading */}
      {bespoke && (
        <div className="text-center mb-5">
          <span className="text-slate-500 font-medium text-sm">{bespoke.eyebrow_label}</span>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
            {bespoke.title}
          </h3>
        </div>
      )}

      {/* Content box - full width, no max-w cap */}
      {bespoke && (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden grid md:grid-cols-2 w-full">

          {/* Left: yellow illustration panel */}
          <div className="bg-[#e9c069] flex items-center justify-center p-6 md:p-8">
            <div className="relative w-full aspect-square max-h-[30rem]">
              {bespoke.image && (
                <Image
                  src={getImageUrl(bespoke.image, 'about-page')}
                  alt={bespoke.title || "Tailoring Measurement"}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-contain"
                />
              )}
            </div>
          </div>

          {/* Right: details */}
          <div className="p-6 md:p-12 lg:p-16 flex flex-col justify-center">
            <div 
              className="text-slate-700 mb-5 leading-relaxed text-[1.0625rem] md:text-lg"
              dangerouslySetInnerHTML={{ __html: bespoke.description }}
            />

            {/* How It Works */}
            {bespoke.items && bespoke.items.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <h4 className="text-lg md:text-xl font-semibold text-slate-900 whitespace-nowrap">
                    How It Works
                  </h4>
                  <div className="h-px w-full bg-slate-200" />
                </div>

                <div className="space-y-4 mb-6">
                  {bespoke.items.map((item, idx) => (
                    <div key={item.item_id || idx} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">
                        <Check size={13} strokeWidth={3} className="text-slate-800" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-base">{item.item_title}</p>
                        <p className="text-sm md:text-[0.9375rem] text-slate-600 mt-0.5">{item.item_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CTA button */}
            {bespoke.button_text && (
              <Link href={bespoke.button_link || "#"} className="bg-[#e9c069] hover:bg-[#dfb355] transition-colors text-slate-900 font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2 w-max text-sm">
                {bespoke.button_text} <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default WhatWeDo;