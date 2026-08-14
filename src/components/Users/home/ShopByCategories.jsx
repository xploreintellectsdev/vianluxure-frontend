"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categoriesData = [
  {
    number: "01",
    badge: "Finest Selection of Fabrics ",
    title: "Chosen with Purpose ",
    description: "Premium fabrics in their purest form. Lightweight or rich in texture, finished with the kind of detailing that rewards a closer look",
    buttonText: "EXPLORE FABRICS",
    link: "/shop/fabric",
  },
  {
    number: "02",
    badge: "READY-TO-WEAR",
    title: "Effortless, Elevated ",
    description:
      "Clean tailoring, ready when the moment calls for it. Choose your fabric, find your fit, and arrive dressed for the occasion.",
    buttonText: "SHOP READY TO WEAR",
    link: "/shop/ready-to-wear",
  },
  {
    number: "03",
    badge: "Made-to-Measure",
    title: "Your Fit, Your Way",
    description:
      "A more personal piece, shaped around you. Choose your details like the collar, cuff, buttons, refined for occasions that deserve them.",
    buttonText: "START PERSONALIZING",
    link: "/shop/made-to-wear",
  },
  {
    number: "04",
    badge: "CUSTOM BESPOKE",
    title: "Fully Yours to customize ",
    description: "Built entirely around your measurements and your taste. For the occasions where nothing off-the-rack will do. ",
    buttonText: "BEGIN BESPOKE",
    link: "/shop/bespoke",
  },
];

const galleryImages = [
  "/images/gallery/pic_1.webp",
  "/images/gallery/product2.webp",
  "/images/gallery/product3.webp",
  "/images/gallery/product4.webp",
  "/images/gallery/product5.webp",
  "/images/gallery/product6.webp",
  "/images/gallery/product7.webp",
  "/images/gallery/product8.webp",
  "/images/gallery/product9.webp",
  "/images/gallery/product10.webp",
  "/images/gallery/product11.webp",
];

export default function ShopByCategories() {
  return (
    <section className="w-full bg-page-bg pt-4 pb-6 lg:pt-6 lg:pb-8 overflow-hidden">
      {/* ================= CATEGORIES CONTAINER ================= */}
      <div className="mx-auto w-full max-w-[120rem] px-[clamp(1rem,3vw,4rem)]">
        {/* HEADER */}
        <div className="mb-[clamp(1.5rem,3vw,2.5rem)] flex flex-col justify-between gap-[clamp(1.5rem,3vw,2rem)] lg:flex-row lg:items-end">
          <div>
            <span className="label-eyebrow mb-4 block">
              SHOP BY
            </span>

            <h2 className="heading-section leading-none">
              Categories
            </h2>
          </div>

          <div className="max-w-[clamp(20rem,40vw,45rem)] lg:text-right">
            <p className="text-body">
              Each fabric is unique and is chosen with purpose for its texture, its presence, and the occasion it's made to elevate.
            </p>
          </div>
        </div>

        {/* CATEGORIES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {categoriesData.map((cat, index) => (
            <div
              key={cat.number}
              className="group relative px-[clamp(0.25rem,0.6vw,0.5rem)]"
            >
              {/* divider between columns */}
              <span
                className={`
                  pointer-events-none
                  absolute
                  right-0
                  top-0
                  h-full
                  w-px
                  bg-text-border
                  ${index === categoriesData.length - 1 ? "hidden" : ""}
                `}
              />

              {/* Hover panel */}
              <div
                className={`
                  relative
                  z-0
                  flex
                  h-full
                  flex-col
                  bg-transparent
                  pt-[clamp(1rem,1.5vw,1.25rem)]
                  pb-[clamp(1.25rem,2vw,1.75rem)]
                  pl-[clamp(0.75rem,1.5vw,1rem)]
                  pr-[clamp(1.25rem,2vw,2rem)]
                  transition-all
                  duration-500
                  ease-out
                `}
              >
                {/* ANIMATED GOLD LINE */}
                <span className="absolute bottom-0 left-0 h-[0.125rem] w-0 bg-category-gold transition-all duration-500 ease-out group-hover:w-full" />

                {/* NUMBER + BADGE */}
                <div className="mb-[clamp(1.25rem,2vw,1.75rem)] flex items-center justify-between">
                  <span className="text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-none text-[#D8D2C8] transition-colors duration-500 group-hover:text-category-gold">
                    {cat.number}
                  </span>

                  <span
                    className="
                      rounded
                      border
                      border-text-border
                      px-[clamp(0.65rem,1vw,1rem)]
                      py-[clamp(0.3rem,0.5vw,0.375rem)]
                      text-[clamp(0.55rem,0.65vw,0.625rem)]
                      font-medium
                      uppercase
                      tracking-[0.22em]
                      text-text-subtle
                      transition-colors
                      duration-500
                      group-hover:border-category-gold
                      group-hover:text-category-gold
                    "
                  >
                    {cat.badge}
                  </span>
                </div>

                {/* TITLE */}
                <h3 className="heading-card mb-[clamp(0.75rem,1.2vw,1rem)] tracking-[-0.03em] group-hover:text-black">
                  {cat.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-body-sm mb-[clamp(1.25rem,2vw,1.75rem)] w-full pr-[clamp(0.5rem,1.5vw,2rem)]">
                  {cat.description}
                </p>

                {/* BUTTON */}
                <div className="mt-auto">
                  <Link
                    href={cat.link}
                    className="btn-category-gold group/button inline-flex items-center gap-[clamp(0.5rem,0.8vw,0.75rem)]"
                  >
                    {cat.buttonText}
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2.2}
                      className="transition-transform duration-300 group-hover/button:translate-x-1 group-hover/button:-translate-y-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= AUTO-SCROLLING GALLERY ================= */}
      <div className="mt-[clamp(0.75rem,1.5vw,1.5rem)] w-full overflow-hidden flex relative group">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...galleryImages, ...galleryImages].map((img, index) => (
            <div
              key={index}
              className="w-[clamp(150px,17vw,350px)] aspect-[4/5] shrink-0 mx-[clamp(0.4rem,0.8vw,0.75rem)] overflow-hidden rounded-[1rem] shadow-sm"
            >
              <img
                src={img}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}