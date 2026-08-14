import DynamicPolicyPage from "@/components/Users/policy/DynamicPolicyPage";

// Dynamic params — no static list needed. The component handles 404 internally.
export const dynamic = 'force-dynamic';

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  // DynamicPolicyPage fetches from DB and shows "Policy Not Found" if page doesn't exist
  return <DynamicPolicyPage pageKey={slug} />;
}