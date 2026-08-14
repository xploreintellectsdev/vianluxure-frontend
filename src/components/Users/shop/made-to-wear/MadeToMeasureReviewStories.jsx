// src/components/shop/madetomeasure/MadeToMeasureReviewStories.jsx
"use client";
import React from 'react';
import HeroReviewStories from "@/components/Users/shop/components/ReviewstoriesHero";

const MadeToMeasureReviewStories = () => {
  const madeToMeasureReviews = [
    {
      name: 'Karthik',
      date: '05.03.2026',
      rating: 3,
      text: 'I was able to choose the collar and button style I wanted. The whole process was simple, and the shirt looked really clean.',
    },
    {
      name: 'Aravind',
      date: '10.02.2026',
      rating: 4,
      text: 'The shirt feels really comfortable for daily wear. I liked the fabric quality, and the fit was much better than regular ready-made shirts.',
    },
    {
      name: 'Rahul',
      date: '08.04.2026',
      rating: 3,
      text: 'The linen fabric feels soft and easy to wear, even for long hours. The stitching and finishing were also done neatly.',
    },
    {
      name: 'Vignesh',
      date: '12.01.2026',
      rating: 5,
      text: 'I liked how the shirt looked after customization. The fit, sleeve style, and overall feel matched what I selected.',
    },
    {
      name: 'Dinesh',
      date: '15.03.2026',
      rating: 4,
      text: 'Good fabric quality and comfortable fit. The shirt feels light, breathable, and suitable for everyday use.',
    },
  ];

  return (
    <HeroReviewStories
      title="Customer Stories"
      reviews={madeToMeasureReviews}
imageSrc="/images/sections/madetowear/product2.webp"
      imageAlt="Customer wearing made to measure shirt"
    />
  );
};

export default MadeToMeasureReviewStories;