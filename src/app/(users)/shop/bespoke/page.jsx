export const dynamic = 'force-dynamic';

import ShopHero from "@/components/Users/shop/components/ShopHero";
import WhatIsBespoke from "@/components/Users/shop/bespoke/WhatIsBespoke";
import WhyBespoke from "@/components/Users/shop/bespoke/WhyBespoke";
import CustomerStories from "@/components/Users/shop/components/CustomerStories";
import BespokeFAQ from "@/components/Users/shop/bespoke/BespokeFAQ";
import BespokeDialog from "@/components/Users/shop/bespoke/BespokeFinal";
// import CompleteBuild from "@/components/Users/shop/bespoke/CompleteBuild";
import { pageInfoApi } from "@/api/pageInfo.api";
import { pageFaqApi } from "@/api/pageFaq.api";

export default async function BespokePage() {
  let whatIs = null;
  let whyChoose = null;
  let faqSection = null;

  try {
    const [infoRes, faqRes] = await Promise.all([
      pageInfoApi.getByPage('bespoke', true).catch(() => null),
      pageFaqApi.getByPage('bespoke', true).catch(() => null)
    ]);
    if (infoRes?.success && infoRes?.data) {
      whatIs = infoRes.data.whatIs;
      whyChoose = infoRes.data.whyChoose;
    }
    if (faqRes?.success && faqRes?.data) {
      faqSection = faqRes.data;
    }
  } catch (err) {
    console.error("Failed to load bespoke page content:", err);
  }
  return (
    <>
      <ShopHero
        image="/images/sections/bespoke/bespokehero.webp"
        title="Built Around Your Measurements"
        description="Create bespoke pieces with personalized measurements, fabric selections, and styling details designed specifically for your individual fit and preferences."
      />
      <BespokeDialog />
      <WhatIsBespoke data={whatIs} />
      <WhyBespoke data={whyChoose} />
      <CustomerStories pageKey="bespoke" />
      <BespokeFAQ data={faqSection} />
      {/* Rest of page */}
    </>
  );
}