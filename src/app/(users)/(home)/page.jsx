import Hero from "@/components/Users/home/Hero";
// import LatestProducts from "@/components/Users/home/LatestProducts";
// import WhoWeAre from "@/components/home/WhoWeAre";
// import ShopByCategories from "@/components/Users/home/ShopByCategories";
// import BespokeSection from "@/components/home/BespokeSection";
import ProductSell from "@/components/Users/home/ProductSell";
import NewArrival from "@/components/Users/home/NewArrival";
import Reviews from "@/components/Users/home/Reviews";
import BestSellers from "@/components/Users/home/BestSellers";
import StorySection from "@/components/Users/home/story-section/StorySection";
import DynamicBanner from "@/components/Users/home/banner/DynamicBanner";

async function getBanners() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/banners?activeOnly=true`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error("Backend returned an error status for banners:", res.status);
      return [];
    }
    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
}

export default async function HomePage() {
  const [banners] = await Promise.all([
    getBanners()
  ]);

  return (
    <>
      <Hero />

      <ProductSell />
      <NewArrival />
      <StorySection sectionKey="story-cotton" />

      {/* <LatestProducts /> */}
      {/* <WhoWeAre /> */}
      <DynamicBanner bannerKey="fabric-shop" banners={banners} />

      <Reviews />

      <DynamicBanner bannerKey="ready-to-wear" banners={banners} />
      {/* <BespokeSection/> */}
      <BestSellers />
      {/* <ShopByCategories/> */}
      <StorySection sectionKey="story-2" />
      <DynamicBanner bannerKey="made-to-wear" banners={banners} />
      <StorySection sectionKey="story-linen" />
      <DynamicBanner bannerKey="bespoke-cta" banners={banners} />
    </>
  );
}