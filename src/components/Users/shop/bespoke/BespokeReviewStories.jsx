// src/components/shop/bespoke/BespokeReviewStories.jsx
"use client";
import React from 'react';
import HeroReviewStories from "@/components/Users/shop/components/ReviewstoriesHero";

const BespokeReviewStories = () => {
  const bespokeReviews = [
    {
      name: 'Hari',
      date: '04.02.2026',
      rating: 3,
      text: 'The Bespoke option helped me get a shirt that actually matched my measurements properly. The overall fit felt much more natural compared to regular shirts.',
    },
    {
      name: 'Praveen',
      date: '10.1.2026',
      rating: 4,
      text: 'I liked being able to choose every detail myself, from the collar style to the buttons. The final shirt looked exactly how I wanted.',
    },
    {
      name: 'Arun Kumar',
      date: '06.04.2026',
      rating: 3,
      text: 'The fabric quality and stitching were really neat. After uploading my measurements, the shirt fit comfortably without needing additional alterations.',
    },
    {
      name: 'Kavin',
      date: '27.03.2026',
      rating: 5,
      text: 'The customization process was simple to follow, and the final output preview helped me understand how the shirt would look before ordering.',
    },
    {
      name: 'Surya',
      date: '20.03.2026',
      rating: 4,
      text: 'What I liked most was the freedom to personalize everything. The shirt felt more personal and better suited for my everyday wear.',
    },
  ];

  return (
    <HeroReviewStories
      title="Customer Stories"
      reviews={bespokeReviews}
      imageSrc="/images/sections/bespoke/product11.webp"
      imageAlt="Customer wearing bespoke tailored shirt"
    />
  );
};

export default BespokeReviewStories;