"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BespokeBuildSummary from "@/components/Users/shop/bespoke/BespokeBuildSummary";
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
        console.error("Failed to load bespoke categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("bespokeBuild");
    if (stored) {
      setBuild(JSON.parse(stored));
    } else {
      router.replace("/shop/bespoke");
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
        <p className="text-[var(--primary-gold)] font-semibold tracking-widest uppercase text-sm animate-pulse">
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

    const mappedCustomizations = [
      ...dynamicCustomizations,
      { type: "chest", data: build.measurements?.chest },
      { type: "length", data: build.measurements?.lengthBack },
      { type: "shoulders", data: build.measurements?.shoulders },
      { type: "sleeve length", data: build.measurements?.sleeve },
      { type: "neck", data: build.measurements?.neck },
      { type: "waist", data: build.measurements?.waist },
      { type: "hips", data: build.measurements?.hips },
      { type: "biceps", data: build.measurements?.biceps },
      { type: "left wrist", data: build.measurements?.leftWrist },
      { type: "right wrist", data: build.measurements?.rightWrist },
      { type: "notes", data: build.measurements?.notes },
      {
        type: "reference file",
        data: build.referenceFile?.url ? resolveImageUrl(build.referenceFile.url) : null,
      },
    ]
      .filter((opt) => opt.data)
      .map((opt) => {
        if (typeof opt.data === "object") {
          return {
            type: opt.type,
            name: opt.data.name || "Standard",
            price: opt.data.price || 0,
          };
        }
        return {
          type: opt.type,
          name: String(opt.data),
          price: 0,
        };
      });

    if (monogram) {
      mappedCustomizations.push({
        type: "Monogram",
        name: `"${monogram.initials}" (Placement: ${monogram.placementName}, Color: ${monogram.colorName}, Font: ${monogram.fontName})`,
        price: monogram.price || 0,
      });
    }

    return {
      id: build.fabric?.id || `bespoke-${Date.now()}`,
      pro_id: build.fabric?.id || 1,
      type: "bespoke",
      name: build.fabric?.name ? `Bespoke — ${build.fabric.name}` : "Bespoke Shirt",
      image: resolvedImage,
      price: total,
      gst: fabric?.fab_gst ? parseFloat(fabric.fab_gst) : (build.fabric?.gst || 0),
      stitching_charges: fabric?.fab_stitching_charges ? parseFloat(fabric.fab_stitching_charges) : (build.fabric?.stitching_charges || 0),
      totalPrice: total,
      quantity: 1,
      isCustom: true,
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

            {/* LEFT: FABRIC IMAGE.
                "About This Fabric" is desktop/laptop (lg+) only here — on
                mobile/tablet it renders instead inside BespokeBuildSummary,
                right below the action buttons. Same responsive pattern as
                Made to Wear's complete-build page. */}
            <div className="lg:sticky lg:top-24">
              <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-section-bg shadow-sm ring-1 ring-text-border">
                {build.fabric?.image && (
                  <Image
                    src={resolveImageUrl(build.fabric.image)}
                    alt={build.fabric?.name || "Bespoke Fabric"}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 90vw, 560px"
                    className="object-cover"
                    priority
                  />
                )}
                <span className="absolute top-4 left-4 bg-[var(--luxury-dark)] text-white text-[0.6875rem] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full z-10">
                  Bespoke
                </span>
              </div>

              {/* ABOUT THIS FABRIC — desktop/laptop (lg+) only.
                  DO NOT remove "hidden lg:block" — that's what keeps
                  mobile/tablet showing it under the buttons instead. */}
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

            {/* RIGHT: SUMMARY (About This Fabric renders here too, below the
                action buttons, but only below lg — see "lg:hidden" inside
                BespokeBuildSummary. On desktop it shows in the left column
                above, under the fabric image, instead.) */}
            <BespokeBuildSummary
              fabricName={build.fabric?.name}
              fabricShortDescription={fabricShortDescription}
              fabricLongDescription={fabricLongDescription}
              selections={selections}
              measurements={build.measurements}
              referenceFile={build.referenceFile}
              total={total}
              fabric={fabric}
              fabricLoading={fabricLoading}
              monogram={monogram}
              onMonogramChange={setMonogram}
              onChangeDesign={() => router.push("/shop/bespoke")}
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