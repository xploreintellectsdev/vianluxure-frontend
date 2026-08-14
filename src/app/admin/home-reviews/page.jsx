import HomeReviewsIndex from "@/components/Admin/home-reviews/HomeReviewsIndex";

export const metadata = {
  title: "Admin - Home Reviews | Vian Luxure",
};

export default function HomeReviewsPage() {
  return (
    <div className="p-6 max-w-[100rem] mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Home Customer Reviews</h1>
        <p className="text-sm text-stone-500 mt-1">Manage the reviews marquee section on the homepage</p>
      </div>
      <HomeReviewsIndex />
    </div>
  );
}
