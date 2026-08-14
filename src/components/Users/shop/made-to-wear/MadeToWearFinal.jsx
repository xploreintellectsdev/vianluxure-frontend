"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ArrowRight, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { customStyleCategoryApi } from "@/api/customStyleCategory.api";

import FabricStep from "./steps/step-1";
import MeasurementStep from "./steps/step-6";
import DynamicStep from "../bespoke/steps/DynamicStep"; // Reuse the same generic step!

const BUILD_STORAGE_KEY = "madeToWearBuild";
const STEP_STORAGE_KEY = "madeToWearStep";

const MadeToWearFinal = () => {
  const router = useRouter();
  
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
        console.error("Failed to load MTW categories", err);
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
  const [zoomedChart, setZoomedChart] = useState(null);
  
  const [build, setBuild] = useState({
    fabric: null,
    fitStyle: null,
    size: null,
  });
  
  const [activeFabricCategory, setActiveFabricCategory] = useState("All");

  const selectOption = (key, value) => {
    setBuild((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    if (!build[STEPS[currentStep].key] && currentStep < STEPS.length - 1) return;
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const goToStep = (index) => {
    if (index <= currentStep || build[STEPS[index - 1]?.key]) {
      setCurrentStep(index);
    }
  };

  const resetBuild = () => {
    setBuild({
      fabric: null,
      fitStyle: null,
      size: null,
    });
    setCurrentStep(0);
    sessionStorage.removeItem(BUILD_STORAGE_KEY);
    sessionStorage.removeItem(STEP_STORAGE_KEY);
  };

  const handleSubmit = () => {
    sessionStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(build));
    router.push("/shop/made-to-wear/complete-build");
  };

  const renderCurrentStep = () => {
    if (!stepsLoaded) {
       return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (currentStep === 0) {
      return (
        <FabricStep
          selectedId={build.fabric?.id}
          onSelect={(item) => selectOption("fabric", item)}
          activeFabricCategory={activeFabricCategory}
          setActiveFabricCategory={setActiveFabricCategory}
        />
      );
    }

    if (currentStep === STEPS.length - 1) {
      return (
        <MeasurementStep
          fitStyle={build.fitStyle}
          size={build.size}
          onFitStyleChange={(val) =>
            setBuild((prev) => ({ ...prev, fitStyle: val }))
          }
          onSizeChange={(val) =>
            setBuild((prev) => ({ ...prev, size: val }))
          }
          onZoom={(img) => setZoomedChart(img)}
          onPrev={goBack}
          onSubmit={handleSubmit}
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
           onSelect={(item) => selectOption(currentCategory.slug, item)}
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

        {/* HEADER SECTION — matches Ready to Wear header style */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-[var(--primary-gold)]" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.25em] text-[var(--primary-gold)]">
              Made to Wear
            </span>
            <span className="h-px w-8 bg-[var(--primary-gold)]" />
          </div>
          <h1
            className="font-serif text-[2.5rem] sm:text-6xl md:text-7xl text-foreground tracking-tight mb-4 leading-[1.05]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Build Your Custom Shirt
          </h1>
          <p className="text-body text-sm max-w-lg mx-auto tracking-wide leading-relaxed">
            Select your preferred fabric, collar, buttons, and fit to craft a
            shirt tailored precisely to your style — piece by piece.
          </p>
        </div>

        {/* RESET CONTROL */}
        <div className="flex items-center justify-end mb-4 px-1">
          <button
            onClick={resetBuild}
            className="group flex items-center gap-1.5 text-[0.625rem] uppercase font-bold tracking-widest text-text-subtle hover:text-red-600 transition-colors"
          >
            <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

        {/* PROGRESS STEPPER — individual cards placed directly on the page */}
        <div className="flex flex-wrap gap-3 mb-10">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isCompleted = Boolean(
              step.key === "measurement"
                ? build.fitStyle && build.size
                : build[step.key]
            );
            const selectedValue =
              step.key === "measurement"
                ? build.size
                  ? `${build.fitStyle} / ${build.size}`
                  : null
                : build[step.key]?.name;

            const statusText = isCompleted
              ? selectedValue
              : isActive
              ? "Selecting…"
              : "Pending";

            return (
              <button
                key={step.key}
                onClick={() => goToStep(i)}
                className={`flex items-center gap-3 flex-1 min-w-[10.625rem] px-4 py-3 rounded-2xl border text-left transition-all ${
                  isCompleted
                    ? "border-[var(--primary-gold)] bg-page-bg"
                    : isActive
                    ? "border-[var(--primary-gold)] border-dashed bg-section-bg"
                    : "border-text-border border-dashed bg-page-bg/60"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0 ${
                    isCompleted
                      ? "bg-[var(--primary-gold)] text-white"
                      : isActive
                      ? "bg-section-bg text-[var(--primary-gold)]"
                      : "bg-section-bg text-text-subtle"
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : `0${i + 1}`}
                </span>

                <span className="min-w-0">
                  <span
                    className={`block text-[0.625rem] font-bold uppercase tracking-widest ${
                      isCompleted || isActive ? "text-[var(--primary-gold)]" : "text-text-subtle"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`block text-sm font-semibold truncate ${
                      isCompleted
                        ? "text-foreground"
                        : isActive
                        ? "text-foreground"
                        : "text-text-subtle"
                    }`}
                  >
                    {statusText}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* DYNAMIC STEP CONTENT — placed directly on the page, no enclosing card */}
        <div className="min-h-[35rem]">
          {renderCurrentStep()}
        </div>

        {/* ACTION BUTTONS FOOTER — on the page, below the step content */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-text-border">
            <button
              onClick={goBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-text-border text-xs font-bold uppercase tracking-widest text-foreground hover:bg-section-bg hover:border-[var(--primary-gold)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft size={14} /> Previous
            </button>

            <button
              onClick={goNext}
              disabled={!build[STEPS[currentStep].key]}
              className="group flex items-center gap-2 px-9 py-3.5 rounded-xl bg-[var(--luxury-dark)] text-white text-xs font-bold uppercase tracking-widest hover:bg-[var(--category-gold-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10 active:scale-95"
            >
              Next Step
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* ZOOM MODAL */}
      {zoomedChart && (
        <div
          onClick={() => setZoomedChart(null)}
          className="fixed inset-0 z-[9999] bg-[var(--luxury-dark)]/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white border border-text-border rounded-[1.75rem] p-5 overflow-hidden shadow-2xl cursor-default"
          >
            <Image
              src={zoomedChart}
              alt="Size chart preview"
              width={1400}
              height={900}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="flex items-center justify-center gap-2 mt-4">
              <p className="text-center text-[0.625rem] uppercase font-bold tracking-widest text-text-subtle">
                Click anywhere to close
              </p>
            </div>
          </div>
        </div>
      )}

      
    </section>
  );
};

export default MadeToWearFinal;