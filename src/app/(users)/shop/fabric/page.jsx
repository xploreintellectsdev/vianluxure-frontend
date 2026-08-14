export const dynamic = 'force-dynamic';

import ShopHero from "@/components/Users/shop/components/ShopHero";
import FabricCollection from "@/components/Users/shop/fabric/complete-build/FabricCollection";
import WhatIsFabric from "@/components/Users/shop/fabric/WhatIsFabric";
import WhyFabrics from "@/components/Users/shop/fabric/WhyFabrics";
import CustomerStories from "@/components/Users/shop/components/CustomerStories";
import FabricsFAQ from "@/components/Users/shop/fabric/FabricsFAQ";
import { pageInfoApi } from "@/api/pageInfo.api";
import { pageFaqApi } from "@/api/pageFaq.api";

export default async function FabricPage() {
  let whatIs = null;
  let whyChoose = null;
  let faqSection = null;

  try {
    const [infoRes, faqRes] = await Promise.all([
      pageInfoApi.getByPage('fabric', true).catch(() => null),
      pageFaqApi.getByPage('fabric', true).catch(() => null)
    ]);
    if (infoRes?.success && infoRes?.data) {
      whatIs = infoRes.data.whatIs;
      whyChoose = infoRes.data.whyChoose;
    }
    if (faqRes?.success && faqRes?.data) {
      faqSection = faqRes.data;
    }
  } catch (err) {
    console.error("Failed to load fabric page content:", err);
  }
  return (
    <>
      <ShopHero
        image="/images/sections/fabrics/custom-tailored-bannar.jpg"
        title="Premium Fabrics for Every Occasion"
        description="Explore finely selected fabrics, chosen for their breathable texture, soft feel, and the moments that call for something special."
      />
      <FabricCollection />
      <WhatIsFabric data={whatIs} />
      <WhyFabrics data={whyChoose} />
      <CustomerStories pageKey="fabric" />
      <FabricsFAQ data={faqSection} />
    </>
  );
}