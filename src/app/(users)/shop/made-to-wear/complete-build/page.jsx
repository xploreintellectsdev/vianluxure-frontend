import CompleteBuild from "@/components/Users/shop/made-to-wear/complete-build/CompleteBuild";
import ArtOfPerfectFit from "@/components/Users/shop/components/ArtOfPerfectFit";
// import ProductReview from "@/components/Users/shop/components/ProductReview";

export default async function CompleteBuildPage({ params }) {
  const { productId } = params;

  return (
    <>
      <CompleteBuild />
      {/* <ProductReview productId={productId} /> */}
      <ArtOfPerfectFit />
    </>
  );
}