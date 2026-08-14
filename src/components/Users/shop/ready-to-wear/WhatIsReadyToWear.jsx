"use client";
import React from 'react';
import { Shirt, Scissors, Maximize } from 'lucide-react';
import WhatIsHero from "@/components/Users/shop/components/WhatIsHero";
import { getIconComponent } from '@/utils/IconMap';

const WhatIsReadyToWear = ({ data }) => {
  if (!data) return null;

  const dynamicFeatures = (data.items || []).map(item => ({
    icon: getIconComponent(item.icon_key),
    title: item.item_title,
    description: item.item_description
  }));

  return (
    <WhatIsHero
      subtitle={data.subtitle}
      title={data.title}
      description={data.description}
      features={dynamicFeatures}
    />
  );
};

export default WhatIsReadyToWear;