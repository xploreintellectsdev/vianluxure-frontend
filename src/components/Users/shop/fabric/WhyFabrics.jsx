"use client";
import React from 'react';
import WhyChooseSection from "@/components/Users/shop/components/Whychoosehero";
import { getImageUrl } from '@/utils/imageUtils';

const WhyFabrics = ({ data }) => {
  if (!data) return null;

  const dynamicFeatures = (data.items || []).map(item => ({
    title: item.item_title,
    desc: item.item_description
  }));

  return (
    <WhyChooseSection
      imageSrc={data.image ? getImageUrl(data.image) : "/images/sections/fabrics/shirt-image.jpg"}
      imageAlt={data.title}
      subtitle={data.subtitle}
      title={data.title}
      description={data.description}
      features={dynamicFeatures}
    />
  );
};

export default WhyFabrics;