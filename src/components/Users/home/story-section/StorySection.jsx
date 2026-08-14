"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { storySectionApi } from "@/api/storySection.api";

export default function StorySection({ sectionKey }) {
  const scrollRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await storySectionApi.getAllSectionsWithCards({ activeOnly: true });
        const allSections = res.data?.data || res.data || [];
        const section = allSections.find(s => 
          s.section_key && sectionKey && 
          s.section_key.toLowerCase() === sectionKey.toLowerCase()
        );
        setData(section);
      } catch (error) {
        console.error("Error fetching story section:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (sectionKey) {
      fetchData();
    }
  }, [sectionKey]);

  if (loading || !data || !data.cards || data.cards.length === 0) {
    return null; 
  }

  const { eyebrow_label, title, description, cards } = data;

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.firstChild
      ? container.firstChild.getBoundingClientRect().width
      : 300;

    container.scrollBy({
      left: direction === "left" ? -(cardWidth + 28) * 2 : (cardWidth + 28) * 2,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full max-w-full bg-page-bg py-3 md:py-4 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 w-full max-w-full px-4 sm:px-6 md:px-12">
        {/* Intro / Title Block — fixed, does NOT scroll */}
        <div className="flex-shrink-0 w-full sm:w-[12.5rem] md:w-[17.5rem] flex flex-col justify-end">
          {eyebrow_label && (
            <span className="label-eyebrow mb-2.5 text-[0.9375rem]">{eyebrow_label}</span>
          )}
          <h2 className="heading-section text-2xl sm:text-[1.75rem] md:text-[2.5rem] leading-tight mb-3">
            {title}
          </h2>
          {description && (
            <p className="text-body-sm text-[0.9375rem] sm:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Scrollable row wrapper */}
        <div className="relative flex-1 min-w-0">
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 md:gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 no-scrollbar w-full max-w-full"
          >
            {cards.map((card, index) => {
              const numberLabel = (index + 1).toString().padStart(2, '0');

              return (
                <div
                  key={card.card_id || index}
                  className="snap-start flex-shrink-0 w-[72vw] sm:w-[16.25rem] md:w-[20rem] flex flex-col"
                >
                  <div className="w-full aspect-[4/3] mb-3 sm:mb-4 relative overflow-hidden rounded-2xl">
                    <img
                      src={getImageUrl(card.image)}
                      alt={card.card_title}
                      className="w-full h-full object-cover drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
                    />
                  </div>

                  {/* Era caption */}
                  <p className="italic text-center text-body text-[0.9375rem] sm:text-base leading-snug mb-3 sm:mb-4 min-h-[2.25rem] sm:min-h-[2.625rem]">
                    {card.caption}
                  </p>

                  {/* Number */}
                  <span className="text-xl sm:text-2xl font-extrabold text-soft-gold mb-1.5 block">
                    {numberLabel}
                  </span>

                  {/* Title */}
                  <h3 className="heading-card text-lg sm:text-xl leading-snug mb-2 sm:mb-2.5">
                    {card.card_title}
                  </h3>

                  {/* Description */}
                  <p className="text-body-sm text-[0.9375rem] sm:text-base">{card.card_description}</p>
                </div>
              );
            })}
          </div>

          {/* ARROW CONTROLS */}
          {cards.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Scroll left"
                className="hidden sm:flex absolute left-0 top-[calc(50%-1.4rem)] -translate-y-1/2 -translate-x-1/2 h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-category-gold hover:text-white z-20"
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Scroll right"
                className="hidden sm:flex absolute right-0 top-[calc(50%-1.4rem)] -translate-y-1/2 translate-x-1/2 h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-category-gold hover:text-white z-20"
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}