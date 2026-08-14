// src/components/shop/readytowear/ReadyToWearReviewStories.jsx
"use client";
import React from 'react';
import HeroReviewStories from "@/components/Users/shop/components/ReviewstoriesHero";

const ReadyToWearReviewStories = () => {
  const readyToWearReviews = [
    {
      name: 'Arun Prakash',
      date: '05.02.2026',
      rating: 3,
      text: 'The Ready-to-Wear collection gave me the perfect fit and premium feel for everyday office wear. The fabric quality and stitching were really impressive.',
    },
    {
      name: 'Vignesh Kumar',
      date: '24.02.2026',
      rating: 4,
      text: 'I was looking for stylish ready-to-wear shirts with a clean professional look, and this collection matched exactly what I needed.',
    },
    {
      name: 'Rahul Srinivasan',
      date: '18.04.2026',
      rating: 3,
      text: 'The fitting, fabric comfort, and finishing details were excellent. It feels premium while still being comfortable for daily use.',
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
      reviews={readyToWearReviews}
      imageSrc="/images/sections/readytowear/product7.webp"
      imageAlt="Customer wearing ready-to-wear shirt"
    />
  );
};

export default ReadyToWearReviewStories;