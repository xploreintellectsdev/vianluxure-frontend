export const dynamic = 'force-dynamic';

import ShopHero from "@/components/Users/shop/components/ShopHero";
import WhatIsMadeToMeasure from "@/components/Users/shop/made-to-wear/WhatIsMadeToMeasure";
import WhyMadeToMeasure from "@/components/Users/shop/made-to-wear/WhyMadeToMeasure";
import CustomerStories from "@/components/Users/shop/components/CustomerStories";
import MadeToMeasureFAQ from "@/components/Users/shop/made-to-wear/MadeToMeasureFAQ";
import MadeToWearDialog from "@/components/Users/shop/made-to-wear/MadeToWearFinal";
import { pageInfoApi } from "@/api/pageInfo.api";
import { pageFaqApi } from "@/api/pageFaq.api";

export default async function MadeToWearPage() {
  let whatIs = null;
  let whyChoose = null;
  let faqSection = null;

  try {
    const [infoRes, faqRes] = await Promise.all([
      pageInfoApi.getByPage('made-to-wear', true).catch(() => null),
      pageFaqApi.getByPage('made-to-wear', true).catch(() => null)
    ]);
    if (infoRes?.success && infoRes?.data) {
      whatIs = infoRes.data.whatIs;
      whyChoose = infoRes.data.whyChoose;
    }
    if (faqRes?.success && faqRes?.data) {
      faqSection = faqRes.data;
    }
  } catch (err) {
    console.error("Failed to load made-to-wear page content:", err);
  }
  return (
    <>
      <ShopHero
        image="/images/sections/madetowear/banner.webp"
        title="Personalize Every Detail "
        description="Create shirts with selected fabrics, structured styling, and finishing details suited for everyday wear."
      />
      <MadeToWearDialog />
      <WhatIsMadeToMeasure data={whatIs} />
      <WhyMadeToMeasure data={whyChoose} />
      <CustomerStories pageKey="made-to-wear" />
      <MadeToMeasureFAQ data={faqSection} />
    </>
  );
}
