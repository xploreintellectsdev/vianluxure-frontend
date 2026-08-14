"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { homeReviewApi } from "@/api/homeReview.api";
import { getImageUrl } from "@/utils/imageUtils";

export default function Reviews({
  reviews: initialReviews,
  ratingCount: initialRatingCount,
  headline: initialHeadline,
}) {
  const [reviewsData, setReviewsData] = useState([]);
  const [headline, setHeadline] = useState(initialHeadline || "Your Delight is Our Mission");
  const [ratingCount, setRatingCount] = useState(initialRatingCount || "1000+");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only fetch if initialReviews are not provided (e.g. not in Admin preview)
    if (!initialReviews) {
      const fetchData = async () => {
        try {
          const res = await homeReviewApi.getPublic();
          if (res?.success && res?.data) {
            const { settings, reviews } = res.data;
            if (settings) {
              if (settings.is_visible === 0) {
                setIsVisible(false);
                return;
              }
              setHeadline(settings.heading || "Your Delight is Our Mission");
              setRatingCount(settings.subheading ? settings.subheading.replace(/\D/g, '') || "1000+" : "1000+");
            }
            if (reviews && reviews.length > 0) {
              setReviewsData(reviews.map(r => ({
                id: r.review_id,
                customerImage: getImageUrl(r.customer_image, 'home-reviews'),
                quote: r.quote,
                authorName: r.author_name,
                authorLocation: r.author_location
              })));
            }
          }
        } catch (err) {
          console.error("Failed to fetch home reviews", err);
        }
      };
      fetchData();
    } else {
      setReviewsData(initialReviews);
      if (initialHeadline) setHeadline(initialHeadline);
      if (initialRatingCount) setRatingCount(initialRatingCount);
    }
  }, [initialReviews, initialHeadline, initialRatingCount]);

  if (!isVisible || reviewsData.length === 0) return null;

  const loopReviews = [...reviewsData, ...reviewsData];

  return (
    <section className="w-full bg-page-bg py-4 lg:py-6 overflow-hidden">
      {/* HEADER */}
      <div className="mx-auto w-full max-w-[120rem] px-[clamp(1rem,3vw,4rem)]">
        <div className="mb-[clamp(1rem,2vw,1.5rem)]">
          <h2 className="heading-section leading-none text-category-gold mb-4">
            {headline}
          </h2>

          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={22}
                className="fill-category-gold text-category-gold"
              />
            ))}
          </div>

          <p className="text-body text-text-subtle">
            Over {ratingCount} 5-star reviews
          </p>
        </div>
      </div>

      {/* ================= IMAGE MARQUEE (slower) ================= */}
      <div className="w-full overflow-hidden flex relative">
        <div
          className="flex w-max animate-marquee-nopause"
          style={{ animationDuration: "60s" }}
        >
          {loopReviews.map((review, index) => (
            <div
              key={`img-${review.id}-${index}`}
              className="w-[clamp(180px,16vw,260px)] aspect-[3/4] shrink-0 mx-[clamp(0.3rem,0.5vw,0.5rem)] overflow-hidden rounded-[1rem]"
            >
              <img
                src={review.customerImage}
                alt={`${review.authorName} wearing VL Global`}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= QUOTE MARQUEE (faster) ================= */}
      <div className="w-full overflow-hidden flex relative mt-[clamp(0.3rem,0.5vw,0.5rem)]">
        <div
          className="flex w-max items-stretch animate-marquee-nopause"
          style={{ animationDuration: "30s" }}
        >
          {loopReviews.map((review, index) => (
            <div
              key={`quote-${review.id}-${index}`}
              className="w-[clamp(180px,16vw,260px)] shrink-0 mx-[clamp(0.3rem,0.5vw,0.5rem)] bg-[#F4EFE8] border border-text-border rounded-[1rem] px-[clamp(0.75rem,1vw,1rem)] pt-[clamp(0.9rem,1.3vw,1.25rem)] pb-[clamp(1rem,1.5vw,1.5rem)]"
            >
              <p className="text-[clamp(0.85rem,0.95vw,0.95rem)] text-text-primary leading-snug mb-3">
                {review.quote}
              </p>
              <p className="text-[clamp(0.75rem,0.85vw,0.8rem)] text-text-subtle">
                — {review.authorName}, {review.authorLocation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}