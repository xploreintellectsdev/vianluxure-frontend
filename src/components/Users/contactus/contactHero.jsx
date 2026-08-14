"use client";
import React from 'react';
import Image from 'next/image';

import { getImageUrl } from '@/utils/imageUtils';

const ContactHero = ({ hero }) => {
  const isActive = hero && hero.is_active === 1;
  const imageSrc = isActive && hero.image ? getImageUrl(hero.image, 'contact-page') : '/images/contact/background.webp';
  
  // Format title to handle line breaks like original, if none provided
  const rawTitle = isActive && hero.title ? hero.title : "Get In-\nTouch With Us";
  // Convert newlines to <br/> tags
  const titleElements = rawTitle.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

  const description = isActive && hero.description ? hero.description : "We love hearing from you! Whether you have questions about our products, need assistance with your order, or simply want to share your thoughts, our team is here to help.";

  return (
    <section className="relative w-full h-[50vh] min-h-[26.25rem]">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={isActive && hero.title ? hero.title.replace('\n', ' ') : "Contact Us"}
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Hero Text */}
      <div className="relative z-20 flex flex-col justify-end items-start h-full w-full pl-3 md:pl-8 pr-6 pb-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-4 whitespace-pre-line">
            {titleElements}
          </h1>
          <p className="text-sm md:text-base font-normal opacity-90 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;