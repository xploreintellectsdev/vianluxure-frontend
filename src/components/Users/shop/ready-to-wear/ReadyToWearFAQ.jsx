"use client";
import React, { Fragment } from 'react';
import HeroFAQ from "@/components/Users/shop/components/FaqHero";

const ReadyToWearFAQ = ({ data }) => {
  const defaultFaqs = [
    {
      question: 'What sizes are available in Ready to Wear?',
      answer: 'Our Ready to Wear collection is available in standard sizes ranging from S to XXL, offering a balanced fit across varying body types.',
    },
    {
      question: 'Can I request alterations for Ready to Wear items?',
      answer: 'Ready to wear pieces are sold as finished garments. We do not provide alterations on these styles, though they are constructed for ease of adjustment by your local tailor if needed.',
    },
    {
      question: 'Are the fabrics the same as the bespoke line?',
      answer: 'Yes, our Ready to Wear collection utilizes the same premium linen and cotton-linen blends offered in our bespoke and fabric-only selections.',
    },
    {
      question: 'How do I care for my linen pieces?',
      answer: 'We recommend cold machine wash or hand washing. Avoid tumble drying, and iron on a medium setting while the fabric is slightly damp to maintain its texture.',
    },
    {
      question: 'Can these styles be worn formally?',
      answer: 'Our designs feature clean, classic tailoring, making them versatile enough to be dressed up for formal settings or worn casually.',
    },
  ];

  if (!data) {
    return (
      <HeroFAQ
        subtitle="Frequently Asked Questions"
        title={<>Everything <br /> You Need <br />to Know</>}
        footerText="Vian Luxure &middot; Ready Styles"
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

export default ReadyToWearFAQ;