"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const WhoWeAre = () => {
  return (
<section className="relative w-full overflow-hidden bg-[#f5f5f5] text-gray-900 py-4 lg:py-6 xl:py-8">
        
      {/* Shirt sketch - moved to the right side */}
<div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[2%] w-full md:w-[65%] lg:w-[50%] max-w-[46.875rem] z-0 pointer-events-none opacity-85">
        <img
          src="/images/sketches/Shirtsketch.svg"
          alt="Shirt Sketch"
          className="w-full h-auto object-contain object-center" 
        />
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 xl:px-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT: TITLE AREA */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            <span className="mb-5 block text-[0.875rem] md:text-[0.9375rem] font-medium uppercase tracking-[0.15em] text-gray-500">
              WHO WE ARE?
            </span>

            <h2 className="font-sans text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5rem] font-medium leading-[1.05] tracking-tight text-[#222222]">
              Weaving<br />
              Elegance<br />
              into<br />
              Every <br/>
              Occasion
            </h2>
          </div>

          {/* MIDDLE: DARK FROSTED GLASS CARD */}
          <div className="lg:col-start-6 lg:col-span-5 relative mt-12 lg:mt-0">
            
            <div className="rounded-[1.25rem] border border-white/10 bg-black/50 p-8 md:p-10 shadow-2xl backdrop-blur-md">

              <p className="text-[0.90625rem] leading-relaxed text-white/95 font-light">
                At VL Global, we create thoughtfully crafted linen shirts designed
                for comfort, simplicity, and everyday living. From carefully
                selected fabrics to refined tailoring details, every piece is made
                to feel natural, breathable, and timeless.
              </p>

              <div className="mt-8 flex justify-end">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#F5C754] px-6 py-3 text-[0.875rem] font-bold text-black transition-all duration-300 hover:bg-[#dfb346] shadow-md hover:shadow-lg"
                >
                  Discover Our Story
                  <ArrowUpRight
                    size={18}
                    strokeWidth={2.5}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;