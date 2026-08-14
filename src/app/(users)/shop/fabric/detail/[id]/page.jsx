import FabricInfoDialog from "@/components/Users/shop/fabric/complete-build/ProductDetails";
import ProductReview from "@/components/Users/shop/components/ProductReview";
import FabricBespokeBanner from "@/components/Users/shop/fabric/complete-build/FabricBespokeBanner";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <>
      <FabricInfoDialog />
      <ProductReview productId={`fabric-${id}`} />
      <FabricBespokeBanner />
    </>
  );
}