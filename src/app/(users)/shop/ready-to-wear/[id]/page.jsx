import ProductDetail from "@/components/Users/shop/ready-to-wear/complete-build/ProductDetail";
import ProductReview from "@/components/Users/shop/components/ProductReview";
import FabricBespokeBanner from "@/components/Users/shop/fabric/complete-build/FabricBespokeBanner";

export default async function ProductPage({ params }) {
  const { id } = await params;

  return (
    <>
      <ProductDetail />
      <ProductReview productId={`rtw-${id}`} />
      <FabricBespokeBanner />
    </>
  );
}