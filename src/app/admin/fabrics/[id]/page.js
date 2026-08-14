import FabricDetailPage from "@/components/Admin/fabrics/FabricDetailPage";

// Next.js 15+ passes `params` as a Promise in the App Router — must be
// awaited (a plain destructure like `{ params: { id } }` would break here).
const Page = async ({ params }) => {
  const { id } = await params;
  return <FabricDetailPage fabId={id} />;
};

export default Page;
