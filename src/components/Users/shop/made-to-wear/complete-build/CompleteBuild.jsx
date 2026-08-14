"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CompleteBuildSummary from "@/components/Users/shop/made-to-wear/complete-build/FinalproductUI";
import { fabricApi } from "@/api/fabric.api";
import { useCart } from "@/components/Users/context/CartContext";

const BUY_NOW_KEY = "vian_buy_now";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

const CompleteBuild = () => {
  const router = useRouter();
  const { addToCart } = useCart();

  const [build, setBuild] = useState(null);
  const [fabric, setFabric] = useState(null);
  const [fabricLoading, setFabricLoading] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [monogram, setMonogram] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { customStyleCategoryApi } = await import('@/api/customStyleCategory.api');
        const res = await customStyleCategoryApi.getAll({ activeOnly: true });
        setDynamicCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load MTW categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("madeToWearBuild");
    if (stored) {
      setBuild(JSON.parse(stored));
    } else {
      router.replace("/shop/made-to-wear");
    }
  }, [router]);

  useEffect(() => {
    const fabricId = build?.fabric?.id;
    if (!fabricId) return;

    let cancelled = false;

    async function loadFabric() {
      try {
        setFabricLoading(true);
        const res = await fabricApi.getById(fabricId);
        const raw = res?.data?.data ?? res?.data ?? null;
        if (!cancelled) setFabric(raw);
      } catch (err) {
        console.error("Failed to fetch fabric detail:", err);
      } finally {
        if (!cancelled) setFabricLoading(false);
      }
    }

    loadFabric();
    return () => {
      cancelled = true;
    };
  }, [build?.fabric?.id]);

  if (!build || dynamicCategories.length === 0) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#cba962] font-semibold tracking-widest uppercase text-sm animate-pulse">
          Loading your design...
        </p>
      </section>
    );
  }

  const fabricShortDescription = fabric?.fab_short_desc ?? "";
  const fabricLongDescription = fabric?.fab_long_desc ?? "";

  const selections = [
    { label: "Fabric", key: "fabric", value: build.fabric },
    ...dynamicCategories.map(cat => ({ label: cat.name, key: cat.slug, value: build[cat.slug] })),
  ];

  const fabricPrice = Number(fabric?.fab_price_per_meter ?? build.fabric?.price) || 0;
  const customizationsPrice = dynamicCategories.reduce((sum, cat) => {
    return sum + (Number(build[cat.slug]?.price) || 0);
  }, 0);
  const total = fabricPrice + customizationsPrice + (monogram ? Number(monogram.price) || 0 : 0);

  // ── CART PAYLOAD BUILDER ──
  const buildCartPayload = () => {
    const resolvedImage = resolveImageUrl(build.fabric?.image);

    const dynamicCustomizations = dynamicCategories.map(cat => ({
      type: cat.slug,
      data: build[cat.slug]
    }));

    const mappedCustomizations = dynamicCustomizations
      .filter((opt) => opt.data && opt.data.name)
      .map((opt) => ({
        type: opt.type,
        name: opt.data.name,
        price: opt.data.price || 0,
      }));

    if (monogram) {
      mappedCustomizations.push({
        type: "Monogram",
        name: `"${monogram.initials}" (Placement: ${monogram.placementName}, Color: ${monogram.colorName}, Font: ${monogram.fontName})`,
        price: monogram.price || 0,
      });
    }

    return {
      id: build.fabric?.id || `mtw-${Date.now()}`,
      pro_id: build.fabric?.id || 1,
      type: "made-to-wear",
      name: build.fabric?.name ? `Made to Wear — ${build.fabric.name}` : "Made to Wear Shirt",
      image: resolvedImage,
      price: total,
      gst: fabric?.fab_gst ? parseFloat(fabric.fab_gst) : (build.fabric?.gst || 0),
      stitching_charges: fabric?.fab_stitching_charges ? parseFloat(fabric.fab_stitching_charges) : (build.fabric?.stitching_charges || 0),
      totalPrice: total,
      quantity: 1,
      size: build.size || "M",
      fit: build.fitStyle || "Slim",
      monogram: monogram ? {
        enabled: true,
        text: monogram.text,
        placementId: monogram.placementId,
        colorId: monogram.colorId,
        fontId: monogram.fontId,
        price: monogram.price
      } : null,
      customizations: mappedCustomizations,
    };
  };

  const handleAddToCart = () => {
    const payload = buildCartPayload();
    addToCart(payload);
  };

  const handleCheckout = () => {
    const payload = buildCartPayload();
    localStorage.setItem(BUY_NOW_KEY, JSON.stringify([payload]));
    router.push("/checkout?buyNow=true");
  };

  return (
    <>
      <section className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-12 md:pb-20 font-sans">
        <div className="mx-auto w-full max-w-[87.5rem] px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* LEFT: FABRIC IMAGE ONLY —
                "About This Fabric" now lives in the right column, directly
                below the action buttons, to match the fabric product page
                pattern (see FinalproductUI / CompleteBuildSummary). */}
            <div className="lg:sticky lg:top-24">
              <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-[#fbf9f4] shadow-sm ring-1 ring-[#e0e0e0]">
                {build.fabric?.image && (
                  <Image
                    src={resolveImageUrl(build.fabric.image)}
                    alt={build.fabric?.name || "Made to Wear Fabric"}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 90vw, 560px"
                    className="object-cover"
                    priority
                  />
                )}
                <span className="absolute top-4 left-4 bg-[#161c24] text-white text-[0.6875rem] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full z-10">
                  Made to Wear
                </span>
              </div>

              {/* ABOUT THIS FABRIC — desktop/laptop (lg+) only.
                  Below lg, this same block renders instead inside
                  CompleteBuildSummary, right under the action buttons.
                  DO NOT remove the "hidden lg:block" here — that's what
                  keeps mobile/tablet exactly as already fixed. */}
              {(fabricLoading || fabricLongDescription) && (
                <div className="hidden lg:block mt-5 border border-[#e0e0e0] rounded-[1.25rem] bg-[#fbf9f4] p-6 shadow-sm">
                  <p className="text-[#161c24] text-[0.6875rem] font-bold tracking-widest uppercase mb-3">
                    About This Fabric
                  </p>
                  {fabricLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-white/70 rounded w-full" />
                      <div className="h-3 bg-white/70 rounded w-5/6" />
                    </div>
                  ) : (
                    <p className="text-[#555555] text-[0.9375rem] leading-[1.7]">
                      {fabricLongDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: SUMMARY (About This Fabric renders here too, right below
                the action buttons — but only below lg; see "lg:hidden" inside
                CompleteBuildSummary. On desktop it's shown in the left column
                above, under the fabric image, instead.) */}
            <CompleteBuildSummary
              fabricName={build.fabric?.name}
              fabricShortDescription={fabricShortDescription}
              fabricLongDescription={fabricLongDescription}
              selections={selections}
              fitStyle={build.fitStyle}
              size={build.size}
              total={total}
              fabric={fabric}
              fabricLoading={fabricLoading}
              monogram={monogram}
              onMonogramChange={setMonogram}
              onChangeDesign={() => router.push("/shop/made-to-wear")}
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default CompleteBuild;