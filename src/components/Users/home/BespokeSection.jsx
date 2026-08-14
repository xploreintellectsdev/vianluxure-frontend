"use client";

import { Check, ArrowUpRight } from "lucide-react";

const steps = [
  {
    title: "It Doesn't Just Fit. It Understands You.",
    desc: "Our process begins not with a tape measure, but with a conversation. We account for every nuance — your posture, your dominant hand, the slope of your shoulders, and how you naturally move. This detailed understanding ensures your garment feels like a second skin, not just a size on a label."},
  {
    title: "Select Your Fit",
    desc: "Ready-to-wear is built for an average frame which is a reliable starting point, but never the final word on how something should fit you.",
  },
  {
    title: "Add Details",
    desc: "Tailoring closes the gap between a standard, off-the-rack piece and your actual physique by refining the shoulders, the arms, and every detail in between until it's unmistakably yours.",
  },
];

export default function BespokeSection() {
  return (
    <section className="w-full bg-page-bg py-9 px-3">
      <div className="mx-auto max-w-[112.5rem]">
        {/* Top Header */}
        <div className="text-center mb-5">
          <span className="label-eyebrow">
            Custom
          </span>
          <h2 className="heading-section mt-2">
            Tailored Just For You
          </h2>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden flex flex-col md:flex-row min-h-[37.5rem]">
          {/* Left Side: Image with Background */}
<div className="w-full md:w-[45%] bg-soft-gold flex items-center justify-center p-6">
  <img
    src="/images/Bespoke/CustomShirt.png"
    alt="Shirt Measurement Sketch"
    className="w-full max-w-[37.5rem] h-auto object-contain brightness-110"
  />
</div>

          {/* Right Side: Content */}
          <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center">
            <p className="text-body mb-6 text-lg text-justify">
              Standard sizing was never built with your exact frame in mind. Your body is 
              individual and for the occasions that matter most, your clothing should be too. 
              This is where we move beyond ready-to-wear and create a piece shaped entirely around your silhouette, 
                your style, and the moment you're dressing for. 
            </p>

            <div className="flex items-center gap-4 mb-6">
              <h3 className="heading-card whitespace-nowrap">
                How It Works
              </h3>
              <span className="h-px w-full bg-gray-200" />
            </div>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Check size={14} style={{ color: "var(--foreground)" }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>
                      {step.title}
                    </h4>
                    <p className="text-body-sm">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-soft-gold mt-8 group flex items-center gap-3 w-fit">
              Bespoke
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}