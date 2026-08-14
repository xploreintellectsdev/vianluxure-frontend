"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { rtwApi } from "@/api/rtw.api";
import { styleApi } from "@/api/style.api";
import { fabricApi } from "@/api/fabric.api";

// API URL Normalization
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function mapRtw(item, index, fabricStyleMap) {
  const styleIds = fabricStyleMap[item.fab_id] ?? [];
  return {
    _id: item.rtw_id ?? `rtw-${index}`,
    name: item.rtw_name ?? "",
    slug: item.rtw_slug ?? "",
    fabId: item.fab_id ?? null,
    styleIds,
    price: item.rtw_price ?? 0,
    image: resolveImageUrl(item.rtw_cover_image),
    tags: [
      item.is_new_arrival ? "New" : null,
      item.is_best_seller ? "Best Seller" : null,
    ].filter(Boolean),
  };
}

function mapStyle(s, index) {
  return {
    id: s.sty_id ?? `style-${index}`,
    name: s.sty_name ?? "Unnamed",
    slug: s.sty_slug ?? "",
  };
}

function extractGalleryUrls(detail) {
  const rawGallery = detail?.images ?? [];
  if (!Array.isArray(rawGallery)) return [];
  return rawGallery.map((g) => resolveImageUrl(g?.img_url)).filter(Boolean);
}

function formatPrice(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

// ── Single product card with gallery cycling
function RtwCard({ product, onClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gallery, setGallery] = useState(null);
  const [fetching, setFetching] = useState(false);
  const intervalRef = useRef(null);

  const sequence = [product.image, ...(gallery ?? [])].filter(Boolean);

  const startCycling = useCallback((seqLength) => {
    if (seqLength <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % seqLength);
    }, 1500);
  }, []);

  const stopCycling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveIndex(0);
  }, []);

  const onEnter = async () => {
    let currentGallery = gallery;

    if (currentGallery === null && !fetching) {
      setFetching(true);
      try {
        const res = await rtwApi.getById(product._id);
        const detail = res?.data?.data ?? res?.data ?? {};
        currentGallery = extractGalleryUrls(detail);
        setGallery(currentGallery);
      } catch (err) {
        console.error("Failed to fetch product detail for gallery:", err);
        currentGallery = [];
        setGallery(currentGallery);
      } finally {
        setFetching(false);
      }
    }

    const fullSequence = [product.image, ...(currentGallery ?? [])].filter(Boolean);
    startCycling(fullSequence.length);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div onClick={onClick} className="group cursor-pointer flex flex-col">
      {/* IMAGE CONTAINER */}
      <div
        onMouseEnter={onEnter}
        onMouseLeave={stopCycling}
        className="relative w-full aspect-[3/4] rounded-[1.25rem] overflow-hidden bg-[#fbf9f4] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:shadow-2xl group-hover:shadow-[#161c24]/10 group-hover:-translate-y-1"
      >
        {sequence.length > 0 ? (
          sequence.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 ${
                i === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ position: "absolute", inset: 0 }}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-[#e0e0e0] uppercase">
            {product.name?.[0] ?? "?"}
          </div>
        )}

        {/* TAGS */}
        {product.tags?.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#cba962] text-white text-[0.625rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit shadow-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* GALLERY PROGRESS DOTS */}
        {sequence.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {sequence.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* SUBTLE HOVER GRADIENT (For dots visibility) */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* TEXT DETAILS */}
      <div className="pt-4 px-2 text-center flex-1 flex flex-col justify-between">
        <h3 className="font-serif text-[1.125rem] md:text-[1.25rem] font-bold text-[#161c24] leading-tight transition-colors duration-300 group-hover:text-[#cba962]">
          {product.name}
        </h3>
        <p className="mt-2.5 text-[1.125rem] md:text-[1.25rem] font-bold text-[#cba962] tracking-wide">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}

// ── MAIN COLLECTION COMPONENT
export default function ProductGrid() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const CATEGORY_LIMIT = 10;

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        setLoading(true);
        setError(null);

        const [styleRes, rtwRes] = await Promise.all([
          styleApi.getAll({ limit: 100 }),
          rtwApi.getAll(),
        ]);

        if (cancelled) return;

        const rawStyles = styleRes?.data?.data ?? styleRes?.data?.styles ?? styleRes?.data ?? [];
        const rawProducts = (rtwRes?.data?.data ?? rtwRes?.data?.items ?? rtwRes?.data ?? []).filter(Boolean);

        const uniqueFabIds = [...new Set(rawProducts.map((p) => p.fab_id).filter(Boolean))];
        const fabricStyleMap = {};
        
        if (uniqueFabIds.length > 0) {
          const fabricResults = await Promise.allSettled(
            uniqueFabIds.map((fabId) => fabricApi.getById(fabId))
          );

          fabricResults.forEach((result, i) => {
            if (result.status !== "fulfilled") return;
            const fabId = uniqueFabIds[i];
            const fabRaw = result.value?.data?.data ?? result.value?.data?.fabric ?? result.value?.data ?? null;
            const styles = Array.isArray(fabRaw?.styles) ? fabRaw.styles : [];
            fabricStyleMap[fabId] = styles.map((s) => s.sty_id).filter((id) => id != null);
          });
        }

        if (cancelled) return;

        const mappedProducts = rawProducts.map((p, i) => mapRtw(p, i, fabricStyleMap));
        
        // Filter out styles that have no products
        const allStyles = Array.isArray(rawStyles) ? rawStyles.map(mapStyle) : [];
        const activeStyleIds = new Set();
        mappedProducts.forEach(p => {
          if (p.styleIds) {
            p.styleIds.forEach(id => activeStyleIds.add(id));
          }
        });
        const filteredStyles = allStyles.filter(s => activeStyleIds.has(s.id));

        setCategories(filteredStyles);
        setAllProducts(mappedProducts);
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to fetch ready-to-wear collection:", err);
        if (!cancelled) setError("Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCategoryClick = useCallback((category) => {
    const nextKey = category === "All" ? "All" : category.slug;
    if (nextKey === activeCategory) return;

    setActiveCategory(nextKey);
    setFilterLoading(true);

    requestAnimationFrame(() => {
      if (category === "All") {
        setProducts(allProducts);
      } else {
        const filtered = allProducts.filter((p) => (p.styleIds ?? []).includes(category.id));
        setProducts(filtered);
      }
      setFilterLoading(false);
    });
  }, [activeCategory, allProducts]);

  const handleProductClick = (rtwId) => {
    router.push(`/shop/ready-to-wear/${rtwId}`);
  };

  const showSkeleton = loading || filterLoading;

  return (
    // FIXED: Zero outer padding so it snaps to the hero and footer perfectly.
    <section className="w-full bg-page-bg">
      <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16 py-10 lg:py-12 font-sans">

        {/* Editorial Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-8 h-[0.125rem] bg-[#cba962]"></span>
            <p className="text-[#cba962] uppercase tracking-[0.25em] text-[0.75rem] md:text-[0.8125rem] font-bold">
              Ready to Wear
            </p>
            <span className="w-8 h-[0.125rem] bg-[#cba962]"></span>
          </div>
          
          <h2 className="font-serif text-[2.75rem] md:text-[3.375rem] lg:text-[3.75rem] font-bold text-[#161c24] leading-[1.05] tracking-tight">
            Collection
          </h2>
        </div>

        {/* Category Filters */}
        {!loading && !error && (
          <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-10">
            <button
              onClick={() => handleCategoryClick("All")}
              className={`px-6 py-2.5 rounded-full text-[0.8125rem] md:text-[0.875rem] font-bold uppercase tracking-wider transition-all duration-300 border ${
                activeCategory === "All"
                  ? "bg-[#cba962] border-[#cba962] text-white shadow-md shadow-[#cba962]/20"
                  : "bg-transparent border-[#e0e0e0] text-[#555555] hover:border-[#cba962] hover:text-[#cba962]"
              }`}
            >
              All
            </button>
            {(showAllCategories ? categories : categories.slice(0, CATEGORY_LIMIT)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`px-6 py-2.5 rounded-full text-[0.8125rem] md:text-[0.875rem] font-bold uppercase tracking-wider transition-all duration-300 border ${
                  activeCategory === cat.slug
                    ? "bg-[#cba962] border-[#cba962] text-white shadow-md shadow-[#cba962]/20"
                    : "bg-transparent border-[#e0e0e0] text-[#555555] hover:border-[#cba962] hover:text-[#cba962]"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {categories.length > CATEGORY_LIMIT && (
              <button
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="px-6 py-2.5 rounded-full text-[0.8125rem] md:text-[0.875rem] font-bold uppercase tracking-wider transition-all duration-300 border bg-transparent border-[#cba962] text-[#cba962] hover:bg-[#cba962] hover:text-white"
              >
                {showAllCategories ? "Show Less" : `+${categories.length - CATEGORY_LIMIT} More`}
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {showSkeleton ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-8 lg:gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="bg-[#161c24]/5 rounded-[1.25rem] aspect-[3/4] animate-pulse" />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-4 w-3/4 bg-[#161c24]/5 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#161c24]/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-[#555555] py-16">
            No products found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-8 lg:gap-y-12">
            {products.map((product) => (
              <RtwCard
                key={product._id}
                product={product}
                onClick={() => handleProductClick(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}