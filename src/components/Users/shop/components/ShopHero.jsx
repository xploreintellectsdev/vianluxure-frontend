"use client";
import { useEffect, useState } from 'react';

export default function ShopHero({
  image,
  title,
  description,
  eyebrow,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative h-[78vh] min-h-[34.375rem] max-h-[50rem] overflow-hidden">
      {/* Background */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />

      {/* Layered overlay - diagonal + bottom fade for more depth than flat left-right */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-[100rem] px-6 sm:px-8 lg:px-20 pb-16 md:pb-20">
          <div
            className={`max-w-4xl transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {eyebrow && (
              <div className="flex items-center gap-3 mb-5">
                <span className="h-[0.125rem] w-8 bg-amber-400" />
                <p className="text-amber-300 uppercase tracking-[0.25em] text-xs md:text-sm font-semibold">
                  {eyebrow}
                </p>
              </div>
            )}

            <h1 className="mb-6 text-[2.625rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-white tracking-tight">
              {title}
            </h1>

            {description && (
              <p className="max-w-xl text-base md:text-lg leading-relaxed text-white/85">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute right-8 lg:right-20 bottom-10 hidden md:flex flex-col items-center gap-2 text-white/60">
          <span className="text-[0.6875rem] uppercase tracking-[0.2em] rotate-90 origin-center translate-y-3">
            Scroll
          </span>
          <span className="w-px h-10 bg-white/30 mt-6" />
        </div>
      </div>
    </section>
  );
}