"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useCart } from "@/components/Users/context/CartContext";
import { customStyleCategoryApi } from "@/api/customStyleCategory.api";

import FabricStep from "./steps/step-1";
import MeasurementStep from "./steps/step-6";
import DynamicStep from "./steps/DynamicStep";

const BUY_NOW_KEY = "vian_buy_now";

// Format Base API URL safely
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

const MEASUREMENT_KEYS = [
  "neck", "leftWrist", "rightWrist", "shoulders", "lengthBack",
  "sleeve", "biceps", "chest", "hips", "waist"
];

const EMPTY_MEASUREMENTS = MEASUREMENT_KEYS.reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  { notes: "" }
);

const EMPTY_BUILD = {
  fabric: null,
  measurements: EMPTY_MEASUREMENTS,
  referenceFile: null,
};

const BespokeDialog = () => {
  const router = useRouter();
  const { addToCart } = useCart();

  const [mounted, setMounted] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [stepsLoaded, setStepsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await customStyleCategoryApi.getAll({ activeOnly: true });
        setDynamicCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load bespoke categories", err);
      } finally {
        setStepsLoaded(true);
      }
    };
    fetchCategories();
  }, []);

  const STEPS = [
    { key: "fabric", label: "Fabric" },
    ...dynamicCategories.map(cat => ({ key: cat.slug, label: cat.name })),
    { key: "measurement", label: "Measurement" },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [activeFabricCategory, setActiveFabricCategory] = useState("All");
  const [isUploading, setIsUploading] = useState(false);

  const [build, setBuild] = useState(EMPTY_BUILD);

  const handleSelect = (key, value) => {
    setBuild((prev) => ({ ...prev, [key]: value }));
  };

  const goToStep = (index) => {
    if (index <= currentStep || build[STEPS[index - 1]?.key]) {
      setCurrentStep(index);
    }
  };

  const stepStatus = (index) => {
    if (index < currentStep) return "done";
    if (index === currentStep) return "active";
    return "pending";
  };

  const handleMeasurementChange = (key, value) => {
    setBuild((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: value },
    }));
  };

  const handleFileSelect = async (file) => {
    const isImage = file.type.startsWith("image/");
    const localPreviewUrl = isImage ? URL.createObjectURL(file) : null;

    setBuild((prev) => ({
      ...prev,
      referenceFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: localPreviewUrl,
        url: null,
      },
    }));

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("referenceFile", file);
      formData.append("orderType", "bespoke");

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/upload-reference`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");
      const data = await response.json();

      setBuild((prev) => ({
        ...prev,
        referenceFile: {
          ...prev.referenceFile,
          url: data.url,
        },
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload reference file. Please try again.");
      handleFileRemove();
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = () => {
    setBuild((prev) => ({ ...prev, referenceFile: null }));
  };

  // ── RESET — clears every selection, all measurements, and the reference file,
  // taking the user back to step 1. ──
  const handleReset = () => {
    setBuild(EMPTY_BUILD);
    setCurrentStep(0);
    setActiveFabricCategory("All");
    sessionStorage.removeItem("bespokeBuild");
    sessionStorage.removeItem("bespokeStep");
  };

  const measurementsComplete = MEASUREMENT_KEYS.every(
    (key) => String(build.measurements[key]).trim() !== ""
  );

  const buildCartPayload = () => {
    const resolvedImage = resolveImageUrl(build.fabric?.image);
    const fabricPrice = Number(build.fabric?.price) || 0;
    const customizationsPrice = dynamicCategories.reduce((sum, cat) => {
      return sum + (Number(build[cat.slug]?.price) || 0);
    }, 0);
    const total = fabricPrice + customizationsPrice;

    const dynamicCustomizations = dynamicCategories.map(cat => ({
      type: cat.slug,
      data: build[cat.slug]
    }));

    return {
      id: build.fabric?.id || `bespoke-${Date.now()}`,
      pro_id: build.fabric?.id || 1,
      type: "bespoke",
      name: build.fabric?.name ? `Bespoke — ${build.fabric.name}` : "Bespoke Shirt",
      image: resolvedImage,
      price: total,
      gst: build.fabric?.gst || 0,
      stitching_charges: build.fabric?.stitching_charges || 0,
      totalPrice: total,
      quantity: 1,
      isCustom: true,

      customizations: [
        ...dynamicCustomizations,
        { type: "chest", data: build.measurements.chest },
        { type: "length", data: build.measurements.lengthBack },
        { type: "shoulders", data: build.measurements.shoulders },
        { type: "sleeve length", data: build.measurements.sleeve },
        { type: "neck", data: build.measurements.neck },
        { type: "waist", data: build.measurements.waist },
        { type: "hips", data: build.measurements.hips },
        { type: "biceps", data: build.measurements.biceps },
        { type: "left wrist", data: build.measurements.leftWrist },
        { type: "right wrist", data: build.measurements.rightWrist },
        { type: "notes", data: build.measurements.notes },
        { type: "reference file", data: build.referenceFile?.url ? resolveImageUrl(build.referenceFile.url) : null }
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
        }),
    };
  };

  const handleAddToCart = () => {
    const payload = buildCartPayload();
    addToCart(payload);
  };

  const handleBuyNow = () => {
    sessionStorage.setItem("bespokeBuild", JSON.stringify(build));
    router.push("/shop/bespoke/complete-build");
  };

  const renderCurrentStep = () => {
    if (!stepsLoaded) {
       return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (currentStep === 0) {
      return (
        <FabricStep
          selectedId={build.fabric?.id}
          onSelect={(item) => handleSelect("fabric", item)}
          activeFabricCategory={activeFabricCategory}
          setActiveFabricCategory={setActiveFabricCategory}
        />
      );
    }

    if (currentStep === STEPS.length - 1) {
      return (
        <MeasurementStep
          measurements={build.measurements}
          onMeasurementChange={handleMeasurementChange}
          referenceFile={build.referenceFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          isComplete={measurementsComplete}
          isUploading={isUploading}
        />
      );
    }

    const currentCategory = dynamicCategories[currentStep - 1];
    if (currentCategory) {
       return (
         <DynamicStep
           slug={currentCategory.slug}
           label={currentCategory.name}
           selectedId={build[currentCategory.slug]?.id}
           onSelect={(item) => handleSelect(currentCategory.slug, item)}
         />
       );
    }

    return null;
  };

  if (!mounted) return null;

  return (
    <section className="min-h-screen bg-page-bg pt-14 pb-12 px-4 sm:px-8 md:px-12 font-sans text-foreground antialiased relative overflow-hidden">
      {/* Ambient background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--luxury-dark) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[31.25rem] h-[31.25rem] rounded-full bg-[var(--primary-gold)]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[25rem] h-[25rem] rounded-full bg-[var(--primary-gold)]/[0.06] blur-3xl" />

      <div className="max-w-[80rem] mx-auto relative">

        {/* HEADER */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-[var(--primary-gold)]" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.25em] text-[var(--primary-gold)]">
              Bespoke
            </span>
            <span className="h-px w-8 bg-[var(--primary-gold)]" />
          </div>
          <h1
            className="font-serif text-[2.5rem] sm:text-6xl md:text-7xl text-foreground tracking-tight mb-4 leading-[1.05]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Build Your Bespoke Shirt
          </h1>
          <p className="text-body text-sm max-w-lg mx-auto tracking-wide leading-relaxed">
            Every detail, chosen by you — from fabric to fit, crafted piece by
            piece into a shirt that's entirely your own.
          </p>
        </div>

        {/* STEP COUNTER + RESET */}
        <div className="flex items-center justify-end gap-4 mb-4 px-1">
          <p className="text-[0.625rem] uppercase font-bold tracking-widest text-text-subtle">
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <span className="h-3 w-px bg-text-border" />
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[0.625rem] uppercase font-bold tracking-widest text-text-subtle hover:text-[var(--primary-gold)] transition-colors"
          >
            <RotateCcw size={12} strokeWidth={2.5} />
            Refresh
          </button>
        </div>

        {/* PROGRESS STEPPER — individual cards placed directly on the page */}
        <div className="flex flex-wrap gap-3 mb-10">
          {STEPS.map((step, i) => {
            const status = stepStatus(i);
            const displayValue =
              step.key === "measurement"
                ? measurementsComplete
                  ? "Entered"
                  : null
                : build[step.key]?.name;

            const statusText =
              displayValue || (status === "active" ? "Selecting…" : "Pending");

            return (
              <button
                key={step.key}
                onClick={() => goToStep(i)}
                className={`flex items-center gap-3 flex-1 min-w-[10.625rem] px-4 py-3 rounded-2xl border text-left transition-all ${
                  status === "done"
                    ? "border-[var(--primary-gold)] bg-page-bg"
                    : status === "active"
                    ? "border-[var(--primary-gold)] border-dashed bg-section-bg"
                    : "border-text-border border-dashed bg-page-bg/60"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0 ${
                    status === "done"
                      ? "bg-[var(--primary-gold)] text-white"
                      : status === "active"
                      ? "bg-section-bg text-[var(--primary-gold)]"
                      : "bg-section-bg text-text-subtle"
                  }`}
                >
                  {status === "done" ? <Check size={16} strokeWidth={3} /> : `0${i + 1}`}
                </span>

                <span className="min-w-0">
                  <span
                    className={`block text-[0.625rem] font-bold uppercase tracking-widest ${
                      status === "pending" ? "text-text-subtle" : "text-[var(--primary-gold)]"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`block text-sm font-semibold truncate ${
                      status === "pending" ? "text-text-subtle" : "text-foreground"
                    }`}
                  >
                    {statusText}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* DYNAMIC STEP CONTENT — no enclosing card */}
        <div className="min-h-[35rem]">
          {renderCurrentStep()}
        </div>

        {/* ACTION BUTTONS FOOTER */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-text-border">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-text-border text-xs font-bold uppercase tracking-widest text-foreground hover:bg-section-bg hover:border-[var(--primary-gold)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={14} /> Previous
          </button>

          {/* If Not Final Step: Show NEXT */}
          {currentStep < STEPS.length - 1 && (
            <button
              onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!build[STEPS[currentStep].key]}
              className="group flex items-center gap-2 px-9 py-3.5 rounded-xl bg-[var(--luxury-dark)] text-white text-xs font-bold uppercase tracking-widest hover:bg-[var(--category-gold-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10 active:scale-95"
            >
              Next Step
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* If Final Step: Show ADD TO CART & BUY NOW */}
          {currentStep === STEPS.length - 1 && (
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!measurementsComplete || isUploading}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[var(--primary-gold)] bg-page-bg border border-[var(--primary-gold)] hover:bg-section-bg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!measurementsComplete || isUploading}
                className="group flex items-center gap-2 px-9 py-3.5 rounded-xl bg-[var(--luxury-dark)] text-white text-xs font-bold uppercase tracking-widest hover:bg-[var(--category-gold-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10 active:scale-95"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Buy it Now
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BespokeDialog;