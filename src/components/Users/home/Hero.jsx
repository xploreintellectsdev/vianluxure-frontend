"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [marqueeItems, setMarqueeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const [slidesRes, marqueeRes] = await Promise.all([
          axiosInstance.get("/hero/slides", { params: { status: '1', limit: 20 } }),
          axiosInstance.get("/hero/marquee", { params: { status: '1', limit: 20 } }),
        ]);
        
        setSlides(slidesRes.data || []);
        setMarqueeItems(marqueeRes.data?.map(item => item.item_text) || []);
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  const marqueeTrack = marqueeItems.length > 0 ? Array(4).fill(marqueeItems).flat() : [];

  // Preload every slide image up front.
  useEffect(() => {
    if (slides.length > 0) {
      slides.forEach((slide) => {
        const img = new window.Image();
        img.src = `${API_URL}${slide.image}`;
      });
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <section className="relative w-full h-[90vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-luxury-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null; // Graceful fallback if no active slides exist
  }

  return (
    <>
      <section className="relative w-full h-[90vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-luxury-dark">
        {/* Background Images */}
        {slides.map((slide, index) => (
          <div
            key={slide.slide_id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            // Forces this layer onto the GPU compositor.
            // Without this, mobile browsers (iOS Safari in particular)
            // often skip animating opacity on plain background-image
            // divs and just snap instead of fading.
            style={{
              willChange: "opacity",
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${API_URL}${slide.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 md:from-black/70 md:via-black/40 to-transparent" />
            </div>
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 w-full h-full">

          {/* Heading */}
          <div className="absolute top-[45%] md:top-1/2 -translate-y-1/2 left-0 w-full px-10 sm:px-12 md:px-16 lg:px-20 z-20">
            <h1 className="heading-hero text-[2rem] leading-[1.2] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem] text-white font-bold whitespace-pre-line text-left max-w-[95%] sm:max-w-full md:max-w-3xl lg:max-w-4xl">
              {slides[currentSlide].title}
            </h1>
          </div>

          {/* =========================================
              BOTTOM CONTENT (MOBILE ONLY LAYOUT) 
             ========================================= */}
          <div className="absolute bottom-6 left-0 w-full px-4 sm:px-8 z-30 flex flex-col gap-4 md:hidden">
            
            {/* Description */}
            {slides[currentSlide].description && (
              <div className="relative z-40 w-full bg-black/75 backdrop-blur-md border border-white/20 rounded-xl px-6 py-5 shadow-2xl">
                <p className="text-white text-base font-medium leading-relaxed text-left drop-shadow-md">
                  {slides[currentSlide].description}
                </p>
              </div>
            )}

            {/* Pagination & CTA Row */}
            <div className="flex flex-row items-center justify-between w-full pl-2">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`transition-all duration-300 rounded-full border border-white/50 ${
                      index === currentSlide
                        ? "w-6 h-1.5 bg-white border-white"
                        : "w-1.5 h-1.5 bg-transparent hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              {/* CTA Button */}
              {slides[currentSlide].button_link && (
                <Link
                  href={slides[currentSlide].button_link}
                  key={slides[currentSlide].slide_id}
                  className="btn-luxury-gold group inline-flex items-center justify-center gap-2 text-[0.8125rem] px-5 py-2.5 rounded-sm"
                >
                  {slides[currentSlide].button_text || "Shop Now"}
                  <ArrowUpRight
                    size={16}
                    className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                  />
                </Link>
              )}
            </div>
          </div>

          {/* =========================================
              BOTTOM CONTENT (DESKTOP ONLY LAYOUT) 
             ========================================= */}
          <div className="absolute bottom-10 left-0 w-full px-12 lg:px-20 z-30 hidden md:grid grid-cols-3 gap-4 items-end">
            
            {/* Left: Description */}
            <div className="flex justify-start w-full">
              {slides[currentSlide].description ? (
                <div className="relative z-40 w-full max-w-sm bg-black/75 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4 shadow-2xl">
                  <p className="text-white text-sm md:text-sm font-medium leading-relaxed text-left drop-shadow-md">
                    {slides[currentSlide].description}
                  </p>
                </div>
              ) : (
                <div className="w-full" />
              )}
            </div>

            {/* Center: Pagination */}
            <div className="flex flex-col items-center gap-3 w-full">
              <span className="text-white/90 text-[0.6875rem] font-bold tracking-[0.2em] uppercase">
                Latest Products
              </span>
              <div className="flex items-center gap-2 md:gap-2.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`transition-all duration-300 rounded-full border border-white/50 ${
                      index === currentSlide
                        ? "w-8 h-1.5 bg-white border-white"
                        : "w-1.5 h-1.5 bg-transparent hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="flex justify-end w-full">
              {slides[currentSlide].button_link && (
                <Link
                  href={slides[currentSlide].button_link}
                  key={slides[currentSlide].slide_id}
                  className="btn-luxury-gold group inline-flex items-center justify-center gap-2 text-base px-8 py-3.5"
                >
                  {slides[currentSlide].button_text || "Shop Now"}
                  <ArrowUpRight
                    size={20}
                    className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 sm:left-4 md:left-6 lg:left-8 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 z-40"
          >
            <ChevronLeft size={24} className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 sm:right-4 md:right-6 lg:right-8 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 z-40"
          >
            <ChevronRight size={24} className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </section>

      {/* SCROLLING MARQUEE STRIP — sits directly below the hero */}
      {marqueeTrack.length > 0 && (
        <div className="relative w-full overflow-hidden bg-luxury-dark py-3 md:py-4">
          <div className="flex w-max animate-hero-marquee items-center whitespace-nowrap">
            {marqueeTrack.map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-2 md:gap-2.5 mx-4 md:mx-6 text-white text-xs sm:text-sm md:text-base font-semibold tracking-wide"
              >
                <Sparkles size={14} className="shrink-0 text-amber-400 md:w-4 md:h-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}


    </>
  );
};

export default Hero;