"use client";
import React, { Fragment } from 'react';
import HeroFAQ from "@/components/Users/shop/components/FaqHero";

const FabricsFAQ = ({ data }) => {
  const defaultFaqs = [
    {
      question: 'What is pure linen fabric?',
      answer: 'Pure linen fabric is made from natural flax fibers known for breathable texture, durability, and lightweight everyday wear.',
    },
    {
      question: 'Is cotton-linen suitable for daily use?',
      answer: 'Yes, cotton-linen blends balance softness and structure, making them comfortable and durable enough for everyday wear.',
    },
    {
      question: 'What is GSM in fabrics?',
      answer: 'GSM stands for grams per square meter, a measure of fabric weight and density that affects thickness and drape.',
    },
    {
      question: 'Are these fabrics suitable for shirting?',
      answer: 'Yes, our linen and cotton-linen fabrics are specifically selected for their texture and weight, ideal for shirt construction.',
    },
    {
      question: 'Does linen become softer after washing?',
      answer: 'Yes, linen naturally softens with each wash while retaining its breathable texture and durability over time.',
    },
  ];

  if (!data) {
    return (
      <HeroFAQ
        subtitle="Frequently Asked Questions"
        title={<>Everything <br /> You Need <br />to Know</>}
        footerText="Vian Luxure &middot; Linen Experts"
        faqs={defaultFaqs}
      />
    );
  }

  const dynamicFaqs = (data.faqs || []).map(faq => ({
    question: faq.question,
    answer: faq.answer
  }));

  // Handle title splitting by |
  let renderedTitle = data.title;
  if (data.title && data.title.includes('|')) {
    const parts = data.title.split('|').map(s => s.trim());
    renderedTitle = parts.map((part, index) => (
      <Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </Fragment>
    ));
  }

  return (
    <HeroFAQ
      subtitle={data.subtitle}
      title={renderedTitle}
      footerText={data.footer_text}
      faqs={dynamicFaqs.length > 0 ? dynamicFaqs : defaultFaqs}
    />
  );
};

export default FabricsFAQ;