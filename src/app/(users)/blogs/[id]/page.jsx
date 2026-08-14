import BlogDetail from "@/components/Users/blogs/BlogDetail";

export default async function BlogUserDetailPage({ params }) {
  const { id } = await params;
  return <BlogDetail id={id} />;
}
