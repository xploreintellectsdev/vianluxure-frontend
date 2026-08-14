// src/components/shop/fabric/FabricReviewStories.jsx
"use client";
import React from 'react';
import HeroReviewStories from "@/components/Users/shop/components/ReviewstoriesHero";
const FabricReviewStories = () => {
  // Define Fabric-specific reviews
  const fabricReviews = [
    {
      name: 'Arjun',
      date: '05.02.2026',
      rating: 3,
      text: 'The fabric feels soft and breathable for everyday wear. The texture and overall quality looked really good.',
    },
    {
      name: 'Karthik',
      date: '24.02.2026',
      rating: 4,
      text: 'I liked the natural linen feel, and the fabric width was perfect for shirt stitching.',
    },
    {
      name: 'Dinesh',
      date: '18.04.2026',
      rating: 3,
      text: 'Good breathable fabric with a soft feel. Suitable for both casual and formal shirt stitching',
    },
    {
      name: 'Karthik Raj',
      date: '19.01.2026',
      rating: 5,
      text: 'Their ready-to-wear designs are modern, well-structured, and easy to style for both casual and formal occasions.',
    },
    {
      name: 'Sanjay Menon',
      date: '04.03.2026',
      rating: 4,
      text: 'What I liked most was the consistency in quality. The shirts looked elegant, felt comfortable, and were ready to wear straight away.',
    },
  ];

  return (
    <HeroReviewStories
      title="Customer Stories"
      reviews={fabricReviews}
      imageSrc="/images/sections/fabrics/product4.webp"
      imageAlt="Customer wearing linen shirt"
    />
  );
};

export default FabricReviewStories;