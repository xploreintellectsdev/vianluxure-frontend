"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fabricApi } from "@/api/fabric.api";
import { fabricCategoryApi } from "@/api/fabricCategory.api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function formatPrice(value) {
  return `₹${Number(value).toLocaleString("en-IN")}.00`;
}

export default function NewArrival() {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // ── NEW: pulled from fabric_master rows flagged is_new_arrival=1
  useEffect(() => {
    fabricApi.getNewArrivals(10)
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // ── NEW: fabric categories for the marquee strip (acts as quick-nav buttons)
  useEffect(() => {
    fabricCategoryApi.getAll()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.firstChild
      ? container.firstChild.getBoundingClientRect().width
      : 300;

    container.scrollBy({
      left: direction === "left" ? -(cardWidth + 16) * 2 : (cardWidth + 16) * 2,
      behavior: "smooth",
    });
  };

  if (!loading && products.length === 0) return null;

  // repeat category list a few times so the marquee track is long enough to scroll seamlessly
  const marqueeItems = categories.length > 0 ? Array(4).fill(categories).flat() : [];

  return (
    <section className="w-full bg-page-bg pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
      <div className="mx-auto w-full max-w-[120rem] px-[clamp(1rem,3vw,4rem)] relative">
        
        {/* HEADER */}
        <div className="mb-[clamp(2rem,4vw,3rem)] flex items-end justify-between border-b border-text-border/20 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold uppercase tracking-widest text-text-primary/60">
              Discover
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-tight text-category-gold">
              New Arrivals
            </h2>
          </div>

          <div className="flex items-center gap-3 pb-1">
            {/* ARROW CONTROLS */}
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              aria-label="Scroll left"
              className="group flex h-[clamp(2.5rem,3.5vw,3rem)] w-[clamp(2.5rem,3.5vw,3rem)] items-center justify-center rounded-full bg-transparent border border-text-border/40 text-text-primary transition-all duration-300 hover:border-category-gold hover:bg-category-gold hover:text-white hover:shadow-lg hover:shadow-category-gold/20 active:scale-95"
            >
              <ChevronLeft size={20} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              aria-label="Scroll right"
              className="group flex h-[clamp(2.5rem,3.5vw,3rem)] w-[clamp(2.5rem,3.5vw,3rem)] items-center justify-center rounded-full bg-transparent border border-text-border/40 text-text-primary transition-all duration-300 hover:border-category-gold hover:bg-category-gold hover:text-white hover:shadow-lg hover:shadow-category-gold/20 active:scale-95"
            >
              <ChevronRight size={20} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* PRODUCT SCROLL ROW OR SKELETON LOADER */}
        {loading ? (
          <div className="flex w-full gap-4 overflow-hidden pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[clamp(240px,22vw,320px)] shrink-0 animate-pulse rounded-2xl bg-text-border/5 p-3">
                <div className="aspect-[3/4] w-full rounded-xl bg-text-border/10"></div>
                <div className="mt-4 h-5 w-3/4 rounded-md bg-text-border/10"></div>
                <div className="mt-2 h-4 w-1/2 rounded-md bg-text-border/10"></div>
                <div className="mt-4 h-6 w-1/3 rounded-md bg-text-border/10"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex w-full gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth"
          >
            {products.map((product) => (
              <Link
                key={product.fab_id}
                href={`/shop/fabric/detail/${product.fab_id}`}
                className="group flex flex-col w-[clamp(240px,22vw,320px)] shrink-0 snap-start rounded-2xl bg-white p-[clamp(0.5rem,1vw,0.75rem)] shadow-sm ring-1 ring-text-border/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-category-gold/10 hover:ring-category-gold/30"
              >
                {/* IMAGE CONTAINER */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#F4EFE8]">
                  <img
                    src={`${API_URL}${product.fab_cover_image}`}
                    alt={product.fab_name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                  />
                  {/* Subtle Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
                  
                  {/* Hover Badge */}
                  <div className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="rounded-full bg-white/95 px-5 py-2.5 text-[0.75rem] font-bold uppercase tracking-widest text-black backdrop-blur-sm shadow-lg">
                      View Fabric
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="flex flex-col flex-1 pt-4 px-2 pb-2">
                  <div className="flex-1">
                    <h3 className="text-[clamp(1rem,1.2vw,1.15rem)] font-bold text-text-primary leading-tight group-hover:text-category-gold transition-colors duration-300">
                      {product.fab_name}
                    </h3>
                    {product.fc_name && (
                      <p className="mt-1 text-[clamp(0.8rem,1vw,0.9rem)] font-medium text-text-primary/50 uppercase tracking-wide">
                        {product.fc_name}
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-[clamp(1.1rem,1.4vw,1.25rem)] font-extrabold text-category-gold">
                    {formatPrice(product.fab_price_per_meter)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FABRIC CATEGORY MARQUEE STRIP
      {marqueeItems.length > 0 && (
        <div className="mt-[clamp(3rem,5vw,4.5rem)] w-full overflow-hidden bg-category-gold/10 py-[clamp(1.5rem,2.5vw,2rem)] border-y border-category-gold/20">
          <div className="flex w-max animate-marquee items-center whitespace-nowrap">
            {marqueeItems.map((cat, i) => (
              <Link
                key={`${cat.fc_id}-${i}`}
                href={`/shop/fabric/category/${cat.fc_slug}`}
                className="group mx-[clamp(0.75rem,1.5vw,1.25rem)] flex shrink-0 items-center gap-2 rounded-full bg-white border border-category-gold/30 px-[clamp(1.5rem,2vw,2rem)] py-[clamp(0.6rem,1vw,0.8rem)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-category-gold hover:bg-category-gold hover:shadow-md"
              >
                <span className="text-[clamp(0.9rem,1.2vw,1rem)] font-bold uppercase tracking-widest text-text-primary group-hover:text-white transition-colors">
                  {cat.fc_name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )} */}

    </section>
  );
}