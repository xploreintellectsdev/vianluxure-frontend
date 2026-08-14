"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Ruler, ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { rtwApi } from "@/api/rtw.api";
import { fabricApi } from "@/api/fabric.api";
import { styleApi } from "@/api/style.api";
import SizeSelectPanel from "@/components/Users/shop/ready-to-wear/complete-build/SizeGuideDrawer";
import { AboutFabric, SpecsSection, ShippingReturnsSection, ReadMoreText, DisclaimerSection } from "./ProductDescription";

// ── IMPORT CART & WISHLIST CONTEXT ──
import { useCart } from "@/components/Users/context/CartContext";
import MonogramSelector from "@/components/Users/shop/monogram/MonogramSelector";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

const THUMB_VISIBLE_LIMIT = 6;
const AUTO_ROTATE_MS = 5000;

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function mapRtwDetail(item) {
  const galleryUrls = Array.isArray(item.images)
    ? item.images.map((i) => i?.img_url ?? i).filter(Boolean)
    : [];

  const rawImages = [item.rtw_cover_image, ...galleryUrls].filter(Boolean);
  const uniqueImages = [...new Set(rawImages)];

  return {
    _id: item.rtw_id,
    fabId: item.fab_id ?? null,
    styId: item.sty_id ?? null,
    title: item.rtw_name ?? "",
    price: item.rtw_price ?? 0,
    stock: item.stock_quantity ?? item.stock ?? 0,
    gst: item.fab_gst ? parseFloat(item.fab_gst) : 0,
    stitching_charges: item.fab_stitching_charges ? parseFloat(item.fab_stitching_charges) : 0,
    shortDescription: item.rtw_short_desc ?? "",
    style: item.sty_name ?? undefined,
    fabricType: item.fab_name ?? null,
    images: uniqueImages.map(resolveImageUrl),
    colors: Array.isArray(item.colors) && item.colors.length > 0 ? item.colors : undefined,
    sizes: Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes : undefined,
  };
}

function mapFabricInfo(f) {
  return {
    name: f.fab_name ?? null,
    gst: f.fab_gst ? parseFloat(f.fab_gst) : 0,
    stitching_charges: f.fab_stitching_charges ? parseFloat(f.fab_stitching_charges) : 0,
    longDescription: f.fab_long_desc ?? "",
    disclaimer: f.fab_disclaimer ?? "",
    specs: [
      f.wt_name && { label: "Weight", value: f.wt_name },
      f.wv_name && { label: "Weave", value: f.wv_name },
      f.pat_name && { label: "Pattern", value: f.pat_name },
      f.col_name && { label: "Color", value: f.col_name },
      ...(Array.isArray(f.specifications)
        ? f.specifications.map((s) => ({
            label: s.spec_title,
            value: s.spec_value,
          }))
        : []),
    ].filter(Boolean),
  };
}

function mapStyleInfo(s) {
  return { name: s.sty_name ?? null };
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();

  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [fabricInfo, setFabricInfo] = useState(null);
  const [styleInfo, setStyleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeColor, setActiveColor] = useState(null);
  const [activeFit, setActiveFit] = useState("Slim");
  const [activeSize, setActiveSize] = useState(null);
  const [specsOpen, setSpecsOpen] = useState(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [thumbsExpanded, setThumbsExpanded] = useState(false);
  const intervalRef = useRef(null);
  
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [monogram, setMonogram] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = product
    ? wishlist.some((item) => item.id === product._id && item.type === "rtw")
    : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await rtwApi.getById(params.id);
        const raw = res?.data?.data ?? res?.data?.item ?? res?.data ?? null;

        if (!raw) {
          setProduct(null);
          return;
        }

        const mapped = mapRtwDetail(raw);
        setProduct(mapped);
        setActiveColor(mapped.colors?.[0]?.name ?? "Black");
        setActiveSize(mapped.sizes?.[4] ?? "XL");
        setActiveImage(0);
        setImgFailed(false);
        setThumbsExpanded(false);

        if (mapped.fabId) {
          try {
            const fabRes = await fabricApi.getById(mapped.fabId);
            const fabRaw = fabRes?.data?.data ?? fabRes?.data?.fabric ?? fabRes?.data ?? null;
            if (fabRaw) setFabricInfo(mapFabricInfo(fabRaw));
          } catch (fabErr) {
            console.error("Failed to fetch linked fabric:", fabErr);
            setFabricInfo(null);
          }
        } else {
          setFabricInfo(null);
        }

        if (mapped.styId) {
          try {
            const styRes = await styleApi.getById(mapped.styId);
            const styRaw = styRes?.data?.data ?? styRes?.data?.style ?? styRes?.data ?? null;
            if (styRaw) setStyleInfo(mapStyleInfo(styRaw));
          } catch (styErr) {
            console.error("Failed to fetch linked style:", styErr);
            setStyleInfo(null);
          }
        } else {
          setStyleInfo(null);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchProduct();
  }, [params?.id]);

  const galleryImages =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image || "/images/sections/readytowear/products/p-1.png"];

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % galleryImages.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(intervalRef.current);
  }, [galleryImages.length]);

  const restartAutoRotate = (index) => {
    setActiveImage(index);
    setImgFailed(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (galleryImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % galleryImages.length);
      }, AUTO_ROTATE_MS);
    }
  };

  const formatPrice = (value) =>
    `₹${Number(value).toLocaleString("en-IN")}`;

  const buildCartPayload = (overrideSize, overrideFit) => {
    const qty = quantity || 1;
    const unitPrice = Number(product.price) + (monogram ? Number(monogram.price) || 0 : 0);
    return {
      id: product._id,
      pro_id: product._id,
      type: "rtw",
      name: product.title,
      price: unitPrice,
      gst: fabricInfo?.gst || product.gst || 0,
      stitching_charges: fabricInfo?.stitching_charges || product.stitching_charges || 0,
      totalPrice: unitPrice * qty,
      image: galleryImages[0],
      color: activeColor,
      fit: overrideFit || activeFit,
      size: overrideSize || activeSize,
      quantity: qty,
      monogram: monogram ? {
        enabled: true,
        text: monogram.text,
        placementId: monogram.placementId,
        colorId: monogram.colorId,
        fontId: monogram.fontId,
        price: monogram.price
      } : null,
      customizations: monogram ? [
        { type: "Monogram", name: `"${monogram.initials}" (Placement: ${monogram.placementName}, Color: ${monogram.colorName}, Font: ${monogram.fontName})`, price: monogram.price }
      ] : [],
    };
  };

  const handleAddToCart = () => {
    if (!activeSize || !activeFit || !activeColor) {
      alert("Please select a size, fit, and color.");
      return;
    }
    const payload = buildCartPayload();
    if (addToCart) addToCart(payload);
  };

  const handleBuyNow = () => {
    if (!activeSize || !activeFit || !activeColor) {
      alert("Please select a size, fit, and color.");
      return;
    }
    const payload = buildCartPayload();
    localStorage.setItem("vian_buy_now", JSON.stringify([payload]));
    router.push("/checkout?buyNow=true");
  };

  const handleWishlistClick = () => {
    if (!product) return;
    toggleWishlist({
      id: product._id,
      name: product.title,
      type: "rtw",
      price: product.price,
      image: galleryImages[0] || null,
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#cba962] font-semibold tracking-widest uppercase text-sm">
          Loading Product...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex items-center justify-center">
        <p className="text-red-500 font-medium">{error || "Product not found."}</p>
      </div>
    );
  }

  const price = product.price || 1650;
  const rtwStitchingCost = Number(fabricInfo?.stitching_charges || product.stitching_charges || 0);
  const fits = ["Slim", "Regular", "Relaxed"];
  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
  const colors = product.colors || [
    { name: "Black", hex: "#111111" },
    { name: "Sapphire", hex: "#2B4560" },
    { name: "Stone", hex: "#A8A39D" },
  ];

  const fabricDescriptionProduct = { longDescription: fabricInfo?.longDescription || "" };
  const fabricDisclaimerProduct = { disclaimer: fabricInfo?.disclaimer || "" };
  const fabricSpecsProduct = { specs: fabricInfo?.specs || [] };
  const fabricTypeLabel = fabricInfo?.name || product.fabricType || null;

  return (
    <section className="w-full bg-white pt-24 pb-12 md:pt-32 md:pb-20 font-sans">
      <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16">
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - IMAGES */}
<div className="w-full lg:w-[35rem] xl:w-[37.5rem] lg:shrink-0 lg:sticky lg:top-24 flex flex-col gap-6">        
      <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Main Image Container - MATCHES FABRIC STYLE */}
              <div className="relative rounded-[1.5rem] overflow-hidden bg-[#fbf9f4] aspect-[4/5] w-full lg:flex-1 shadow-sm ring-1 ring-[#e0e0e0]">
                {galleryImages[activeImage] && !imgFailed ? (
                  <Image
                    key={galleryImages[activeImage]}
                    src={galleryImages[activeImage]}
                    alt={product.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 90vw, 600px"
                    className="object-cover transition-opacity duration-700 ease-in-out"
                    onError={() => setImgFailed(true)}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-[#e0e0e0] uppercase">
                    {product.title?.[0] ?? "?"}
                  </div>
                )}
              </div>

              {/* Desktop Vertical Thumbnails */}
              {galleryImages.length > 1 && (() => {
                const hasOverflow = !thumbsExpanded && galleryImages.length > THUMB_VISIBLE_LIMIT;
                const visibleCount = hasOverflow ? THUMB_VISIBLE_LIMIT : galleryImages.length;
                const hiddenCount = galleryImages.length - THUMB_VISIBLE_LIMIT + 1;

                return (
                  <div className={`hidden lg:flex flex-col gap-3 shrink-0 w-16 h-[43.75rem] xl:h-[46.875rem] ${
                    thumbsExpanded ? "overflow-y-auto scrollbar-none" : "overflow-hidden"
                  }`}>
                    {galleryImages.slice(0, visibleCount).map((img, i) => {
                      const isLastVisible = hasOverflow && i === visibleCount - 1;

                      return (
                        <button
                          key={i}
                          onClick={() => isLastVisible ? setThumbsExpanded(true) : restartAutoRotate(i)}
                          className={`relative rounded-[0.875rem] overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-[5.3125rem] ${
                            activeImage === i && !isLastVisible
                              ? "border-[#cba962] shadow-md"
                              : "border-transparent opacity-60 hover:opacity-100 hover:border-[#cba962]/50"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.title} ${i + 1}`}
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
            {galleryImages.length > 1 && (
              <div className="flex lg:hidden flex-row gap-3 overflow-x-auto scrollbar-none pb-2">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => restartAutoRotate(i)}
                    className={`relative rounded-[0.875rem] overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-20 ${
                      activeImage === i
                        ? "border-[#cba962] shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${product.title} ${i + 1}`} fill unoptimized sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop About Fabric (Left Column) */}
            <div className="hidden lg:block border-t border-[#e0e0e0] pt-6 mt-2">
              <AboutFabric product={fabricDescriptionProduct} />
            </div>
          </div>

          {/* RIGHT COLUMN - DETAILS */}
          <div className="flex flex-col gap-6 flex-1 min-w-0 w-full pt-2">
            
            {/* Header / Title / Price */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[0.125rem] w-6 bg-[#cba962]" />
                <p className="text-[#cba962] uppercase tracking-[0.2em] text-[0.75rem] font-bold">
                  {fabricTypeLabel || "Classic Style"}
                </p>
              </div>

              <h1 className="font-serif text-[2rem] md:text-[2.75rem] text-[#161c24] font-bold leading-[1.1] capitalize mb-3 tracking-tight">
                {product.title}
              </h1>
              
              {product.shortDescription && (
                <ReadMoreText text={product.shortDescription} wordLimit={350} className="text-[#555555] text-[0.9375rem] leading-[1.7] max-w-xl mb-4" />
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-[1.625rem] md:text-[1.875rem] font-bold text-[#cba962]">
                  {formatPrice(Number(price) + (monogram ? Number(monogram.price) || 0 : 0))}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold tracking-wide">
                    GST Included
                  </span>
                  {rtwStitchingCost > 0 && (
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold tracking-wide">
                      Stitching (Included)
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Availability Badge */}
              <div className="flex items-center gap-2 mt-4">
                {Number(product.stock) > 0 ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 rounded-full text-[0.8125rem] font-semibold tracking-wide shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    In Stock: {product.stock} units available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200/60 rounded-full text-[0.8125rem] font-semibold tracking-wide shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* ── OPTIONS CARD (Matches Fabric Meter Selector styling) ── */}
            <div className="border border-[#e0e0e0] rounded-[1.25rem] p-6 bg-[#fbf9f4] shadow-sm w-full max-w-xl mt-2">
              
              {/* Color */}
              <div className="mb-6">
                <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase mb-3">
                  Color — <span className="text-[#888888] ml-1 capitalize">{activeColor}</span>
                </p>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setActiveColor(c.name)}
                      title={c.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all p-[0.1875rem] ${
                        activeColor === c.name
                          ? "border-[#cba962] shadow-md shadow-[#cba962]/20"
                          : "border-transparent hover:border-[#e0e0e0]"
                      }`}
                    >
                      <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit */}
              <div className="mb-6">
                <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase mb-3">Fit</p>
                <div className="grid grid-cols-3 gap-3">
                  {fits.map((fit) => (
                    <button
                      key={fit}
                      onClick={() => setActiveFit(fit)}
                      className={`py-2.5 rounded-full font-bold text-[0.8125rem] tracking-wide transition-all duration-300 border ${
                        activeFit === fit
                          ? "bg-[#cba962] border-[#cba962] text-white shadow-md shadow-[#cba962]/20"
                          : "bg-white border-[#e0e0e0] text-[#555555] hover:border-[#cba962] hover:text-[#cba962]"
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase">Select Size</p>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[#cba962] text-[0.625rem] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-[#161c24] transition-colors"
                  >
                    <Ruler size={12} /> Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setActiveSize(size)}
                      className={`py-2.5 rounded-full font-bold text-[0.8125rem] tracking-wide transition-all duration-300 border ${
                        activeSize === size
                          ? "bg-[#cba962] border-[#cba962] text-white shadow-md shadow-[#cba962]/20"
                          : "bg-white border-[#e0e0e0] text-[#555555] hover:border-[#cba962] hover:text-[#cba962]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monogram Selector */}
              <div className="pt-4 border-t border-[#e0e0e0]">
                <MonogramSelector value={monogram} onChange={setMonogram} />
              </div>
            </div>

            {/* Action Buttons (Matches Fabric) */}
            <div className="flex flex-col gap-3 w-full max-w-xl">
              <div className="flex gap-3 w-full">
                
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between w-[7.5rem] px-3 border-2 border-[#161c24] rounded-full bg-transparent text-[#161c24]">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 hover:text-[#cba962] transition-colors"><Minus size={14} strokeWidth={2.5} /></button>
                  <span className="text-[0.875rem] font-bold">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="p-2 hover:text-[#cba962] transition-colors"><Plus size={14} strokeWidth={2.5} /></button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-[#161c24] bg-transparent text-[#161c24] font-bold text-[0.875rem] uppercase tracking-wider py-4 rounded-full transition-all duration-300 hover:bg-[#161c24] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  Add to Cart
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlistClick}
                  className="flex items-center justify-center w-[3.625rem] border-2 border-[#e0e0e0] bg-transparent rounded-full transition-all duration-300 hover:border-[#cba962] group"
                >
                  <Heart
                    size={22}
                    className={`transition-colors duration-300 ${
                      isWishlisted ? "fill-[#cba962] text-[#cba962]" : "text-[#161c24] group-hover:text-[#cba962]"
                    }`}
                  />
                </button>
              </div>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#cba962] text-white font-bold text-[0.875rem] uppercase tracking-wider py-4 rounded-full shadow-lg shadow-[#cba962]/20 transition-all duration-300 hover:bg-[#b59555] hover:shadow-xl hover:-translate-y-0.5"
              >
                Buy It Now
              </button>
            </div>

            <div className="block lg:hidden border-t border-[#e0e0e0] pt-6 mt-2">
              <AboutFabric product={fabricDescriptionProduct} />
            </div>

            {/* Accordions */}
            <div className="flex flex-col w-full max-w-xl">
              <SpecsSection product={fabricSpecsProduct} specsOpen={specsOpen} setSpecsOpen={setSpecsOpen} />
              <ShippingReturnsSection isOpen={shippingOpen} onToggle={() => setShippingOpen((prev) => !prev)} />
              <DisclaimerSection product={fabricDisclaimerProduct} isOpen={disclaimerOpen} onToggle={() => setDisclaimerOpen((prev) => !prev)} />
            </div>

          </div>
        </div>
      </div>

      <SizeSelectPanel
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onAddToBag={({ size, fit }) => {
          const payload = buildCartPayload(size, fit);
          if (addToCart) addToCart(payload);
          setIsSizeGuideOpen(false);
        }}
        onSaveSize={({ size, fit }) => {
          setActiveSize(size);
          setActiveFit(fit);
          setIsSizeGuideOpen(false);
        }}
      />
    </section>
  );
}