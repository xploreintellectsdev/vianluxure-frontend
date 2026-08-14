export const dynamic = 'force-dynamic';

import ShopHero from "@/components/Users/shop/components/ShopHero";
import WhatIsReadyToWear from "@/components/Users/shop/ready-to-wear/WhatIsReadyToWear";
import WhyReadyToWear from "@/components/Users/shop/ready-to-wear/WhyReadyToWear";
import CustomerStories from "@/components/Users/shop/components/CustomerStories";
import ReadyToWearFAQ from "@/components/Users/shop/ready-to-wear/ReadyToWearFAQ";
// IMPORT THE NEW GRID INSTEAD OF THE DIALOG
import ProductGrid from "@/components/Users/shop/ready-to-wear/complete-build/ProductGrid"; 
import { pageInfoApi } from "@/api/pageInfo.api";
import { pageFaqApi } from "@/api/pageFaq.api";

export default async function ReadyToWearPage() {
  let whatIs = null;
  let whyChoose = null;
  let faqSection = null;

  try {
    const [infoRes, faqRes] = await Promise.all([
      pageInfoApi.getByPage('ready-to-wear', true).catch(() => null),
      pageFaqApi.getByPage('ready-to-wear', true).catch(() => null)
    ]);
    if (infoRes?.success && infoRes?.data) {
      whatIs = infoRes.data.whatIs;
      whyChoose = infoRes.data.whyChoose;
    }
    if (faqRes?.success && faqRes?.data) {
      faqSection = faqRes.data;
    }
  } catch (err) {
    console.error("Failed to load ready-to-wear page content:", err);
  }
  return (
    <>
      <ShopHero
        image="/images/sections/readytowear/banner.jpg"
        title="Ready Styles for Every Occasion"
        description="Choose your preferred fabric, size, and fit from pieces designed with clean tailoring and refined styling."
      />
      {/* USE THE NEW GRID HERE */}
      <ProductGrid />
      <WhatIsReadyToWear data={whatIs} />
      <WhyReadyToWear data={whyChoose} />
      <CustomerStories pageKey="ready-to-wear" />
      <ReadyToWearFAQ data={faqSection} />
    </>
  );
}