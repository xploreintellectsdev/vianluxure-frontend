"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { artOfPerfectFitAPI } from "@/api/artOfPerfectFit.api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

const ArtOfPerfectFit = ({ previewData = null }) => {
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!previewData);

  useEffect(() => {
    if (previewData) {
      setData(previewData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await artOfPerfectFitAPI.getArtOfPerfectFit();
        setData(res?.data || null);
      } catch (error) {
        console.error("Error fetching Art of Perfect Fit:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [previewData]);

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstChild?.offsetWidth || 400;
    scrollRef.current.scrollBy({
      left: direction === "next" ? cardWidth + 32 : -(cardWidth + 32),
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const pct = maxScroll > 0 ? (el.scrollLeft / maxScroll) * 100 : 0;
    setProgress(pct);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [data]);

  if (loading) {
    return (
      <section className="relative w-full py-16 md:py-24 overflow-hidden flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#cba962] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  // Do not render if not active or no steps
  if (!data || (!data.is_active && !previewData) || !data.steps || data.steps.length === 0) {
    return (
      previewData ? (
        <section className="relative w-full py-16 md:py-24 overflow-hidden flex items-center justify-center">
          <p className="text-gray-500 font-medium">No steps available to preview.</p>
        </section>
      ) : null
    );
  }

  const { title, steps } = data;

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden">
      <div className="mx-auto w-[92%] max-w-[118.75rem]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#cba962]" />
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.25em] text-[#cba962]">
                Our Process
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl text-[#161c24] font-bold tracking-tight leading-[1.05]">
              {title || "The Art of the Perfect Fit"}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => scrollByAmount("prev")}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#e0e0e0] hover:border-[#cba962] hover:text-[#cba962] text-[#161c24] transition-all duration-300"
              aria-label="Previous step"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => scrollByAmount("next")}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#161c24] text-white hover:bg-[#cba962] transition-all duration-300"
              aria-label="Next step"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {steps.map((step, index) => {
             const imageUrl = resolveImageUrl(step.image_url);
             return (
              <div
                key={step.step_id || index}
                className="snap-start shrink-0 w-[82%] sm:w-[52%] lg:w-[27%] group"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-[#fbf9f4] ring-1 ring-[#e0e0e0] transition-shadow duration-500 group-hover:shadow-xl group-hover:shadow-[#161c24]/10">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={step.title}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 82vw, 27vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                      No Image
                    </div>
                  )}
                </div>

                {/* Text panel — below image, not overlaid */}
                <div className="flex gap-5 mt-6">
                  <span className="font-serif text-5xl md:text-6xl text-[#e5dcc8] font-bold leading-none shrink-0 select-none">
                    {String(step.display_order || step.step_id || index + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-serif text-xl md:text-2xl text-[#161c24] font-bold leading-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#555555] text-[0.875rem] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-12 h-[0.125rem] bg-[#e0e0e0] rounded-full overflow-hidden max-w-[17.5rem] mx-auto">
          <div
            className="h-full bg-[#cba962] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default ArtOfPerfectFit;