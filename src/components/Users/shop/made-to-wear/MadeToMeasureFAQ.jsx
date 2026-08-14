"use client";
import React, { Fragment } from 'react';
import HeroFAQ from "@/components/Users/shop/components/FaqHero";

const MadeToMeasureFAQ = ({ data }) => {
  const defaultFaqs = [
    {
      question: 'How does Made to Wear differ from Bespoke?',
      answer: 'Made to Wear uses a pre-existing size pattern as a base and allows you to customize fabrics and specific details like collars and cuffs. Bespoke involves drafting an entirely new pattern based solely on your individual measurements.',
    },
    {
      question: 'Can I choose any fabric for Made to Wear?',
      answer: 'Yes, you can select from our full range of premium linen and cotton-linen blends to personalize your Made to Wear garment.',
    },
    {
      question: 'What details can I customize?',
      answer: 'You can typically customize the fabric, collar style, cuff style, and placket, allowing you to tailor the shirt’s look to your preferences.',
    },
    {
      question: 'How long does the Made to Wear process take?',
      answer: 'The process generally takes 2-3 weeks from the moment you finalize your design choices until the completed garment is ready for delivery.',
    },
    {
      question: 'Do I need to be measured in person?',
      answer: 'While we recommend using our sizing guide to select the best base fit, in-person measurements are not strictly required for Made to Wear, unlike our Bespoke service.',
    },
  ];

  if (!data) {
    return (
      <HeroFAQ
        subtitle="Frequently Asked Questions"
        title={<>Everything <br /> You Need <br />to Know</>}
        footerText="Vian Luxure &middot; Made to Wear"
        faqs={defaultFaqs}
      />
    );
  }

  const dynamicFaqs = (data.faqs || []).map(faq => ({
    question: faq.question,
    answer: faq.answer
  }));

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

export default MadeToMeasureFAQ;