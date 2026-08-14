"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fabricCategoryApi } from "@/api/fabricCategory.api";

// Max cards shown before switching to scroll layout
const MAX_VISIBLE = 6;
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Maps your database columns to the frontend fields
function mapCategory(c, index) {
  return {
    _id: c.fc_id ?? `category-${index}`,
    order: index,
    name: c.fc_name ?? "",
    badge: "",
    // ── FIX: Add the API_URL so the image actually loads on the storefront! ──
    image: c.fc_image ? `${API_URL}${c.fc_image}` : "",
    link: c.fc_slug ? `/shop/${c.fc_slug}` : "#",
  };
}

export default function ProductSell() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);

      // ── FIX: onlyWithProducts=true so empty categories don't show on the storefront ──
      const res = await fabricCategoryApi.getAll({ limit: 100, onlyWithProducts: true });

      let raw = [];
      if (Array.isArray(res)) raw = res;
      else if (Array.isArray(res?.data)) raw = res.data;
      else if (Array.isArray(res?.data?.data)) raw = res.data.data;
      else if (Array.isArray(res?.data?.categories)) raw = res.data.categories;
      else if (Array.isArray(res?.categories)) raw = res.categories;
      else if (res?.data?.items && Array.isArray(res.data.items)) raw = res.data.items;

      const mapped = raw.map((c, i) => mapCategory(c, i));
      setCategories(mapped);
    } catch (err) {
      console.error("Failed to fetch product categories:", err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const onFocus = () => fetchCategories();
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchCategories();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(fetchCategories, 60000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [fetchCategories]);

  const isScrollable = categories.length > MAX_VISIBLE;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(Math.ceil(el.scrollLeft) > 0);
    setCanScrollRight(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth);
  }, []);

  useEffect(() => {
    if (!isScrollable) return;

    // Gives the browser 150ms to draw the circles before checking if arrows are needed
    const timer = setTimeout(updateScrollButtons, 150);

    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
    }

    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [isScrollable, categories, updateScrollButtons]);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 140;
    el.scrollBy({ left: direction * (cardWidth * 2.5), behavior: "smooth" });
  };

  return (
    <section className="w-full bg-page-bg pt-3 pb-5 xs:pt-4 xs:pb-6 lg:pt-6 lg:pb-8">
      <div className="mx-auto w-full max-w-[120rem] px-4 xs:px-5 sm:px-6 md:px-8 lg:px-[clamp(1.5rem,3vw,4rem)] relative">

        {/* HEADER */}
        <div className="mb-3 xs:mb-4 sm:mb-5 lg:mb-[clamp(1rem,2vw,1.5rem)]">
          <span className="block mb-2 xs:mb-3 text-[0.6875rem] xs:text-xs tracking-[0.15em] uppercase text-text-subtle font-semibold">
            TOP PICKS
          </span>
          <h2 className="leading-none font-bold text-2xl xs:text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[clamp(2rem,3.5vw,3rem)]">
            What&apos;s Selling
          </h2>
        </div>

        {/* PRODUCT CONTAINER */}
        <div className="relative rounded-2xl xs:rounded-3xl border border-text-border bg-white/40 p-3 xs:p-4 sm:p-5 lg:p-[clamp(0.75rem,1.5vw,1.5rem)]">
          {loading ? (
            <div className="flex flex-wrap justify-center gap-4 xs:gap-6 sm:gap-8 lg:gap-[clamp(1.5rem,3vw,2.5rem)]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-24 xs:w-28 sm:w-32 md:w-36 lg:w-[8.75rem] xl:w-[10rem] aspect-square rounded-full bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-8 xs:py-10 text-sm xs:text-base">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-text-subtle py-8 xs:py-10 text-sm xs:text-base">
              No categories available right now.
            </p>
          ) : (
            <div className="relative group/slider">

              {/* LEFT ARROW BUTTON — hidden on touch/mobile, shown from lg up where hover makes sense */}
              {isScrollable && (
                <button
                  onClick={() => scrollByAmount(-1)}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left"
                  className={`hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 xl:w-12 xl:h-12 items-center justify-center rounded-full bg-white border border-gray-200 shadow-lg transition-all duration-300
                    ${canScrollLeft ? 'opacity-100 hover:bg-category-gold hover:text-white hover:border-category-gold cursor-pointer scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* RIGHT ARROW BUTTON */}
              {isScrollable && (
                <button
                  onClick={() => scrollByAmount(1)}
                  disabled={!canScrollRight}
                  aria-label="Scroll right"
                  className={`hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 xl:w-12 xl:h-12 items-center justify-center rounded-full bg-white border border-gray-200 shadow-lg transition-all duration-300
                    ${canScrollRight ? 'opacity-100 hover:bg-category-gold hover:text-white hover:border-category-gold cursor-pointer scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                >
                  <ChevronRight size={22} />
                </button>
              )}

              {/* SLIDER WRAPPER */}
              <div
                ref={scrollRef}
                className={
                  isScrollable
                    ? "flex gap-4 xs:gap-5 sm:gap-6 lg:gap-[clamp(1.25rem,2.5vw,2rem)] overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain px-1 xs:px-2 pb-3 xs:pb-4 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    : "flex flex-wrap justify-center gap-x-4 xs:gap-x-6 sm:gap-x-8 lg:gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-6 xs:gap-y-8 pb-3 xs:pb-4 pt-2"
                }
              >
                {categories.map((item) => (
                  <Link
                    key={item._id}
                    href={item.link}
                    className={
                      isScrollable
                        ? "group flex flex-col items-center flex-shrink-0 snap-start w-24 xs:w-28 sm:w-32 md:w-36 lg:w-[8.75rem] xl:w-[10rem]"
                        : "group flex flex-col items-center w-24 xs:w-28 sm:w-32 md:w-36 lg:w-[8.75rem] xl:w-[10rem]"
                    }
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-full border border-text-border bg-[#F4EFE8] shadow-sm ring-4 ring-transparent transition-all duration-300 group-hover:ring-category-gold/20 group-hover:shadow-md">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl xs:text-3xl sm:text-4xl font-semibold text-text-subtle uppercase transition-transform duration-500 ease-out group-hover:scale-110">
                          {item.name?.[0] ?? "?"}
                        </div>
                      )}
                    </div>

                    <span className="mt-2.5 xs:mt-3 sm:mt-4 text-[0.6875rem] xs:text-xs sm:text-sm lg:text-[clamp(0.85rem,1vw,1rem)] font-semibold text-gray-800 tracking-wide text-center leading-tight transition-colors duration-300 group-hover:text-category-gold px-1">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}