"use client";
import React, { Fragment } from 'react';
import HeroFAQ from "@/components/Users/shop/components/FaqHero";

const BespokeFAQ = ({ data }) => {
  const defaultFaqs = [
    {
      question: 'What is the Bespoke process?',
      answer: 'Our bespoke process involves taking detailed measurements to draft a unique pattern, allowing you to select fabrics and customize every styling detail for a garment tailored exclusively to you.',
    },
    {
      question: 'How long does a Bespoke shirt take?',
      answer: 'Given the precise nature of drafting a custom pattern and constructing the garment from scratch, the bespoke process typically takes 3-4 weeks.',
    },
    {
      question: 'Do I need to be measured in person?',
      answer: 'For the initial bespoke order, we highly recommend an in-person measurement session to ensure the accuracy required for drafting your unique pattern.',
    },
    {
      question: 'Are there fittings involved?',
      answer: 'Depending on the complexity of the fit, a fitting session may be arranged to refine the drafted pattern before the final garment is completed.',
    },
    {
      question: 'Can I reorder once my pattern is created?',
      answer: 'Yes, once your bespoke pattern is finalized and kept on file, you can easily reorder new shirts in different fabrics and styles using that established fit.',
    },
  ];

  if (!data) {
    return (
      <HeroFAQ
        subtitle="Frequently Asked Questions"
        title={<>Everything <br /> You Need <br />to Know</>}
        footerText="Vian Luxure &middot; Bespoke Experts"
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

export default BespokeFAQ;