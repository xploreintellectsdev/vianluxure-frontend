"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Ruler, ShoppingCart, Heart, Scissors, Sparkles, ChevronDown } from "lucide-react";
import { fabricApi } from "@/api/fabric.api";
import { AboutFabric, SpecsSection, ShippingReturnsSection, DisclaimerSection } from "./ProductDescription";

// ── IMPORT CART & WISHLIST CONTEXT ──
import { useCart } from "@/components/Users/context/CartContext"; 

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

const METER_PRESETS = [1.4, 1.6, 1.8];
const MAIN_IMAGE_SIZE = 560;
const THUMB_SIZE = 64;
const AUTO_ROTATE_MS = 5000;

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function mapFabricDetail(f) {
  const galleryUrls = Array.isArray(f.images)
    ? f.images.map((item) => item?.img_url).filter(Boolean)
    : [];

  const rawImages = [f.fab_cover_image, ...galleryUrls].filter(Boolean);
  const uniqueImages = [...new Set(rawImages)];

  const categoryName =
    f.pt_name ??
    f.fc_name ??
    f.category_name ??
    f.fabric_category_name ??
    f.category?.fc_name ??
    f.fabric_category?.fc_name ??
    null;

  return {
    _id: f.fab_id,
    name: f.fab_name ?? "",
    category: categoryName ?? "Uncategorized",
    price: f.fab_price_per_meter ?? 0,
    gst: f.fab_gst ? parseFloat(f.fab_gst) : 0,
    stitching_charges: f.fab_stitching_charges ? parseFloat(f.fab_stitching_charges) : 0,
    unit: "meter",
    stock: f.stock_quantity ?? f.fab_stock ?? f.stock ?? 0,
    shortDescription: f.fab_short_desc ?? "",
    longDescription: f.fab_long_desc ?? "",
    disclaimer: f.fab_disclaimer ?? "",
    productTypes: Array.isArray(f.productTypes)
      ? f.productTypes
      : (typeof f.pt_name === 'string'
          ? f.pt_name.split(',').map((name) => ({ pt_name: name.trim() }))
          : []),
    images: uniqueImages.map(resolveImageUrl),
    specs: [
  f.wt_name && { label: "Weight", value: f.wt_name },
  f.wv_name && { label: "Weave", value: f.wv_name },
  f.pat_name && { label: "Pattern", value: f.pat_name },
  // f.col_name && { label: "Color", value: f.col_name },
  ...(Array.isArray(f.specifications)
    ? f.specifications.map((s) => ({
        label: s.spec_title,
        value: s.spec_value,
      }))
    : []),
].filter(Boolean),
  };
}

const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  
  // ── PULL CONTEXT FUNCTIONS ──
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const intervalRef = useRef(null);

  const [selectedMeter, setSelectedMeter] = useState(METER_PRESETS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [thumbsExpanded, setThumbsExpanded] = useState(false);

  const THUMB_VISIBLE_LIMIT = 6;

  // ── DYNAMICALLY CHECK IF PRODUCT IS IN WISHLIST ──
  const isWishlisted = product ? wishlist.some(item => item.id === product._id && item.type === "fabric") : false;

  const isBespokeAvailable = Array.isArray(product?.productTypes) && 
    product.productTypes.some((pt) => {
      const name = pt.pt_name?.toLowerCase().replace(/\s+|-/g, "") || "";
      const slug = pt.pt_slug?.toLowerCase().replace(/\s+|-/g, "") || "";
      return name.includes("bespoke") || slug.includes("bespoke") || pt.pt_id === 6;
    });

  const isMtwAvailable = Array.isArray(product?.productTypes) && 
    product.productTypes.some((pt) => {
      const name = pt.pt_name?.toLowerCase().replace(/\s+|-/g, "") || "";
      const slug = pt.pt_slug?.toLowerCase().replace(/\s+|-/g, "") || "";
      return name.includes("made") || name.includes("mtw") || slug.includes("made") || slug.includes("mtw") || pt.pt_id === 5;
    });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fabricApi.getById(params.id);
        const raw = res?.data?.data ?? res?.data?.fabric ?? res?.data ?? null;

        if (!raw) {
          setProduct(null);
          return;
        }

        setProduct(mapFabricDetail(raw));
        setActiveImage(0);
        setSelectedMeter(METER_PRESETS[0]);
        setIsCustom(false);
        setCustomValue("");
        setThumbsExpanded(false);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchProduct();
  }, [params?.id]);

  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % product.images.length);
    }, AUTO_ROTATE_MS);

    return () => clearInterval(intervalRef.current);
  }, [product?.images]);

  const restartAutoRotate = (index) => {
    setActiveImage(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (product?.images && product.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % product.images.length);
      }, AUTO_ROTATE_MS);
    }
  };

  const handlePresetClick = (m) => {
    setIsCustom(false);
    setSelectedMeter(m);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setCustomValue(String(selectedMeter));
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setCustomValue(val);
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setSelectedMeter(num);
      }
    }
  };

  const effectiveMeter =
    isCustom && customValue !== "" && !isNaN(parseFloat(customValue))
      ? parseFloat(customValue)
      : selectedMeter;

  const totalPrice = product ? product.price * effectiveMeter : 0;

  const buildCartItem = () => {
    if (!product || effectiveMeter <= 0) return null;

    return {
      id: product._id,
      name: product.name,
      type: "fabric",
      price: product.price,
      gst: product.gst || 0,
      stitching_charges: product.stitching_charges || 0,
      quantity: effectiveMeter,
      totalPrice: totalPrice,
      image: product.images[0] || null,
      customizations: [],
    };
  };

  const handleAddToCart = () => {
    const cartItem = buildCartItem();
    if (!cartItem) return;
    addToCart(cartItem);
  };

  const handleWishlistClick = () => {
    if (!product) return;
    
    const wishlistItem = {
      id: product._id,
      name: product.name,
      type: "fabric", 
      price: product.price,
      image: product.images[0] || null,
    };

    toggleWishlist(wishlistItem);
  };

  const handleBuyNow = () => {
    const cartItem = buildCartItem();
    if (!cartItem) return;

    try {
      localStorage.setItem("vian_buy_now", JSON.stringify([cartItem]));
    } catch (err) {
      console.error("Failed to store buy-now item", err);
      return;
    }

    router.push("/checkout?buyNow=true");
  };

  const handleOpenInBespoke = () => {
    if (!product) return;
    const selectedFabric = {
      id: product._id,
      name: product.name,
      category: product.category || "Uncategorized",
      image: product.images[0] || "",
      price: product.price,
      gst: product.gst || 0,
      stitching_charges: product.stitching_charges || 0,
      priceLabel: `₹${product.price} / m`
    };
    try {
      const existing = JSON.parse(sessionStorage.getItem("bespokeBuild") || "{}");
      sessionStorage.setItem("bespokeBuild", JSON.stringify({ ...existing, fabric: selectedFabric }));
      sessionStorage.setItem("bespokeStep", "1");
    } catch (err) {
      console.error("Failed to set bespoke build", err);
    }
    router.push("/shop/bespoke");
  };

  const handleOpenInMtw = () => {
    if (!product) return;
    const selectedFabric = {
      id: product._id,
      name: product.name,
      category: product.category || "Uncategorized",
      image: product.images[0] || "",
      price: product.price,
      gst: product.gst || 0,
      stitching_charges: product.stitching_charges || 0,
      priceLabel: `₹${product.price} / m`
    };
    try {
      const existing = JSON.parse(sessionStorage.getItem("madeToWearBuild") || "{}");
      sessionStorage.setItem("madeToWearBuild", JSON.stringify({ ...existing, fabric: selectedFabric }));
      sessionStorage.setItem("madeToWearStep", "1");
    } catch (err) {
      console.error("Failed to set made to wear build", err);
    }
    router.push("/shop/made-to-wear");
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#cba962] font-semibold tracking-widest uppercase text-sm">
          Loading Fabric...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex items-center justify-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex items-center justify-center">
        <p className="text-[#555555]">Product not found.</p>
      </div>
    );
  }

  return (
    <section className="w-full bg-white pt-24 pb-12 md:pt-32 md:pb-20 font-sans">
      <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16">
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - IMAGES */}
{/* LEFT COLUMN - IMAGES */}
<div className="w-full lg:w-[35rem] xl:w-[37.5rem] lg:shrink-0 lg:sticky lg:top-24 flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Main Image */}
              <div
                className="relative rounded-[1.5rem] overflow-hidden bg-[#fbf9f4] aspect-square w-full lg:flex-1 shadow-sm ring-1 ring-[#e0e0e0]"
              >
                {product.images[activeImage] ? (
                  <Image
                    key={product.images[activeImage]}
                    src={product.images[activeImage]}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 90vw, 600px"
                    className="object-cover transition-opacity duration-700 ease-in-out"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-[#e0e0e0] uppercase">
                    {product.name?.[0] ?? "?"}
                  </div>
                )}
              </div>

              {/* Desktop Vertical Thumbnails */}
              {product.images.length > 1 && (() => {
                const hasOverflow =
                  !thumbsExpanded && product.images.length > THUMB_VISIBLE_LIMIT;
                const visibleCount = hasOverflow
                  ? THUMB_VISIBLE_LIMIT
                  : product.images.length;
                const hiddenCount = product.images.length - THUMB_VISIBLE_LIMIT + 1;

                return (
                  <div
                    className={`hidden lg:flex flex-col gap-3 shrink-0 w-16 h-[35rem] xl:h-[37.5rem] ${
                      thumbsExpanded ? "overflow-y-auto scrollbar-none" : "overflow-hidden"
                    }`}
                  >
                    {product.images.slice(0, visibleCount).map((img, i) => {
                      const isLastVisible = hasOverflow && i === visibleCount - 1;

                      return (
                        <button
                          key={i}
                          onClick={() =>
                            isLastVisible
                              ? setThumbsExpanded(true)
                              : restartAutoRotate(i)
                          }
                          className={`relative rounded-[0.875rem] overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-16 ${
                            activeImage === i && !isLastVisible
                              ? "border-[#cba962] shadow-md"
                              : "border-transparent opacity-60 hover:opacity-100 hover:border-[#cba962]/50"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${i + 1}`}
                            fill
                            unoptimized
                            sizes="64px"
                            className={`object-cover ${isLastVisible ? "brightness-50" : ""}`}
                          />
                          {isLastVisible && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                              +{hiddenCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Mobile Horizontal Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex lg:hidden flex-row gap-3 overflow-x-auto scrollbar-none pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => restartAutoRotate(i)}
                    className={`relative rounded-[0.875rem] overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-16 ${
                      activeImage === i
                        ? "border-[#cba962] shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop About Fabric (Left Column) */}
            <div className="hidden lg:block border-t border-[#e0e0e0] pt-6 mt-2">
              <AboutFabric product={product} />
            </div>
          </div>

          {/* RIGHT COLUMN - DETAILS */}
          <div className="flex flex-col gap-8 flex-1 min-w-0 w-full">
            
            {/* Title & Price Header */}
            <div>
              {/* Luxury Category Eyebrow */}
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[0.125rem] w-6 bg-[#cba962]" />
                <p className="text-[#cba962] uppercase tracking-[0.2em] text-[0.75rem] font-bold">
                  {product.category}
                </p>
              </div>

              <h1 className="font-serif text-[2rem] md:text-[2.75rem] text-[#161c24] font-bold leading-[1.1] capitalize mb-4 break-words tracking-tight">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-[#555555] text-[0.9375rem] md:text-[1rem] leading-[1.7] max-w-xl">
                  {product.shortDescription}
                </p>
              )}
              
              <p className="text-[1.625rem] md:text-[1.875rem] font-bold text-[#cba962] mb-4">
                ₹{product.price}
                <span className="text-[1rem] font-medium text-[#888888] ml-1">
                  / {product.unit}
                </span>
              </p>

              {/* Stock Availability Badge */}
              <div className="flex items-center gap-2 mb-4">
                {Number(product.stock) > 0 ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 rounded-full text-[0.8125rem] font-semibold tracking-wide shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    In Stock: {product.stock} meters available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200/60 rounded-full text-[0.8125rem] font-semibold tracking-wide shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Currently Out of Stock
                  </span>
                )}
              </div>

              
            </div>

            {/* Meter Selector Card */}
            <div className="border border-[#e0e0e0] rounded-[1.25rem] p-6 bg-[#fbf9f4] shadow-sm w-full max-w-xl">
              <div className="flex items-center gap-2 mb-5">
                <Ruler size={16} className="text-[#161c24]" />
                <span className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">
                  Select Meters Required
                </span>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <select
                    value={isCustom ? "custom" : selectedMeter}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        handleCustomClick();
                      } else {
                        handlePresetClick(parseFloat(val));
                      }
                    }}
                    className="w-full border border-[#e0e0e0] rounded-[0.75rem] px-5 py-3.5 text-[0.875rem] font-bold text-[#161c24] focus:outline-none focus:border-[#cba962] focus:ring-1 focus:ring-[#cba962] bg-white transition-all appearance-none cursor-pointer shadow-sm pr-11"
                  >
                    {METER_PRESETS.map((m) => (
                      <option key={m} value={m}>
                        {m} Meters
                      </option>
                    ))}
                    <option value="custom">Custom Meters</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#cba962]">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {isCustom && (
                <div className="mb-6">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customValue}
                    onChange={handleCustomChange}
                    placeholder="Enter meters, e.g. 2.5"
                    className="w-full border border-[#e0e0e0] rounded-[0.75rem] px-5 py-3 text-[0.875rem] text-[#161c24] focus:outline-none focus:border-[#cba962] focus:ring-1 focus:ring-[#cba962] bg-white transition-shadow"
                  />
                </div>
              )}

              {/* Total Calculation */}
              <div className="flex items-center justify-between bg-white border border-[#e0e0e0] rounded-[1rem] px-5 py-4 shadow-sm">
                <div>
                  <p className="text-[#888888] text-[0.625rem] font-bold uppercase tracking-widest mb-1">
                    Selected
                  </p>
                  <p className="text-[#161c24] font-bold text-[0.9375rem]">
                    {effectiveMeter > 0 ? effectiveMeter : 0} Meters
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#888888] text-[0.625rem] font-bold uppercase tracking-widest mb-1">
                    Total
                  </p>
                  <p className="text-[#cba962] font-extrabold text-[1.125rem]">
                    ₹{totalPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xl">
              
              <div className="flex gap-3 w-full">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={effectiveMeter <= 0}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-[#161c24] bg-transparent text-[#161c24] font-bold text-[0.875rem] uppercase tracking-wider py-4 rounded-full transition-all duration-300 hover:bg-[#161c24] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  Add to Cart
                </button>

                {/* Wishlist Icon Button */}
                <button
                  onClick={handleWishlistClick}
                  className="flex items-center justify-center w-[3.625rem] border-2 border-[#e0e0e0] bg-transparent rounded-full transition-all duration-300 hover:border-[#cba962] group"
                >
                  <Heart
                    size={22}
                    className={`transition-colors duration-300 ${
                      isWishlisted 
                        ? "fill-[#cba962] text-[#cba962]" 
                        : "text-[#161c24] group-hover:text-[#cba962]"
                    }`}
                  />
                </button>
              </div>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={effectiveMeter <= 0}
                className="w-full bg-[#cba962] text-white font-bold text-[0.875rem] uppercase tracking-wider py-4 rounded-full shadow-lg shadow-[#cba962]/20 transition-all duration-300 hover:bg-[#b59555] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Buy It Now
              </button>

              {/* Bespoke & Made to Wear redirection buttons */}
              {(isBespokeAvailable || isMtwAvailable) && (
                <div className="mt-2 pt-4 border-t border-dashed border-[#e0e0e0] flex flex-col sm:flex-row gap-3 w-full">
                  {isBespokeAvailable && (
                    <button
                      onClick={handleOpenInBespoke}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-[#cba962] bg-[#fdfaf2] text-[#cba962] font-bold text-[0.8125rem] uppercase tracking-wider py-3.5 px-4 rounded-full transition-all duration-300 hover:bg-[#cba962] hover:text-white hover:shadow-md active:scale-95"
                    >
                      <Scissors size={17} strokeWidth={2.2} />
                      <span>Open in Bespoke</span>
                    </button>
                  )}
                  {isMtwAvailable && (
                    <button
                      onClick={handleOpenInMtw}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-[#cba962] bg-[#fdfaf2] text-[#cba962] font-bold text-[0.8125rem] uppercase tracking-wider py-3.5 px-4 rounded-full transition-all duration-300 hover:bg-[#cba962] hover:text-white hover:shadow-md active:scale-95"
                    >
                      <Sparkles size={17} strokeWidth={2.2} />
                      <span>Open in Made to Wear</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="block lg:hidden border-t border-[#e0e0e0] pt-6 mt-2">
              <AboutFabric product={product} />
            </div>

            {/* Specs + Shipping/Returns Accordions */}
            <div className="flex flex-col gap-5 border-t border-[#e0e0e0] pt-8 mt-2 w-full max-w-xl">
              <SpecsSection
                product={product}
                specsOpen={specsOpen}
                setSpecsOpen={setSpecsOpen}
              />
              <ShippingReturnsSection
                isOpen={shippingOpen}
                onToggle={() => setShippingOpen((prev) => !prev)}
              />
              <DisclaimerSection
                product={product}
                isOpen={disclaimerOpen}
                onToggle={() => setDisclaimerOpen(prev => !prev)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;