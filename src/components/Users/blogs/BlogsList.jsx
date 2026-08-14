// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight, Calendar, BookOpen, Clock } from "lucide-react";
// import { blogApi } from "@/api/blog.api";

// const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// const BlogsList = () => {
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await blogApi.getAll({ status: "1", limit: 100, sort: "order_no", order: "ASC" });
//         const list = res.data?.data || res.data || [];
//         setBlogs(list);
//       } catch (err) {
//         console.error("Error fetching blogs:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBlogs();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pt-28 pb-20">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 rounded-full border-4 border-[#C8A64D] border-t-transparent animate-spin" />
//           <p className="text-stone-500 text-sm font-semibold uppercase tracking-widest">Loading Editorial Stories...</p>
//         </div>
//       </div>
//     );
//   }

//   const featuredBlog = blogs.length > 0 ? blogs[0] : null;
//   const gridBlogs = blogs.length > 1 ? blogs.slice(1) : [];

//   return (
//     <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-24 pt-28 px-4 md:px-8 xl:px-0">
//       <div className="max-w-7xl mx-auto space-y-16">
//         {/* Header Section */}
//         <div className="text-center max-w-2xl mx-auto space-y-4">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C8A64D]/30 shadow-sm">
//             <BookOpen size={15} className="text-[#C8A64D]" />
//             <span className="text-xs font-black tracking-widest text-[#C8A64D] uppercase">Editorial & Insights</span>
//           </div>
//           <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
//             The Vian Luxure Journal
//           </h1>
//           <p className="text-stone-600 font-normal leading-relaxed text-base md:text-lg">
//             Discover craftsmanship stories, tailoring traditions, style inspiration, and the finest fabrics curated by our bespoke masters.
//           </p>
//         </div>

//         {blogs.length === 0 ? (
//           <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/60 shadow-sm">
//             <p className="text-stone-500 font-serif text-xl">Our editorial articles will be arriving shortly.</p>
//             <p className="text-xs font-bold text-[#C8A64D] uppercase tracking-widest mt-2">Check back soon for inspiring stories</p>
//           </div>
//         ) : (
//           <div className="space-y-16">
//             {/* Featured Hero Blog */}
//             {featuredBlog && (
//               <Link href={`/blogs/${featuredBlog.blog_id}`} className="group block">
//                 <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/60 shadow-md hover:shadow-xl hover:border-[#C8A64D]/50 transition-all duration-500 grid grid-cols-1 lg:grid-cols-12">
//                   <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[28.125rem] overflow-hidden bg-stone-100">
//                     <img
//                       src={`${API_URL}${featuredBlog.blog_image}`}
//                       alt={featuredBlog.blog_title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
//                     />
//                     <div className="absolute top-4 left-4 bg-[#C8A64D] text-white text-[0.6875rem] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
//                       Featured Feature
//                     </div>
//                   </div>

//                   <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
//                         <Calendar size={14} className="text-[#C8A64D]" />
//                         <span>
//                           {featuredBlog.published_date
//                             ? new Date(featuredBlog.published_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
//                             : "Recent Story"}
//                         </span>
//                       </div>
//                       <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 group-hover:text-[#C8A64D] transition-colors leading-snug">
//                         {featuredBlog.blog_title}
//                       </h2>
//                       <p className="text-stone-600 text-sm sm:text-base leading-relaxed line-clamp-4 font-normal">
//                         {featuredBlog.short_description || featuredBlog.blog_content?.replace(/<[^>]*>?/gm, "").slice(0, 220) + "..."}
//                       </p>
//                     </div>

//                     <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-6">
//                       <span className="text-sm font-bold text-[#C8A64D] tracking-wider uppercase group-hover:underline flex items-center gap-2">
//                         Read Full Article
//                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             )}

//             {/* Grid for Remaining Blogs */}
//             {gridBlogs.length > 0 && (
//               <div>
//                 <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight mb-8 pb-3 border-b border-[#C8A64D]/30 flex items-center justify-between">
//                   <span>Recent Articles</span>
//                   <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-sans">{gridBlogs.length} Stories</span>
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                   {gridBlogs.map((item) => (
//                     <Link key={item.blog_id} href={`/blogs/${item.blog_id}`} className="group block h-full">
//                       <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/60 shadow-sm hover:shadow-lg hover:border-[#C8A64D]/50 transition-all duration-300 flex flex-col h-full">
//                         <div className="relative h-60 overflow-hidden bg-stone-100">
//                           <img
//                             src={`${API_URL}${item.blog_image}`}
//                             alt={item.blog_title}
//                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
//                           />
//                         </div>

//                         <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
//                           <div className="space-y-3">
//                             <div className="flex items-center gap-2 text-[0.6875rem] font-semibold text-stone-500">
//                               <Calendar size={12} className="text-[#C8A64D]" />
//                               <span>
//                                 {item.published_date
//                                   ? new Date(item.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
//                                   : "Editorial"}
//                               </span>
//                             </div>

//                             <h4 className="text-xl font-serif font-bold text-slate-900 group-hover:text-[#C8A64D] transition-colors leading-snug line-clamp-2">
//                               {item.blog_title}
//                             </h4>

//                             <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 font-normal">
//                               {item.short_description || item.blog_content?.replace(/<[^>]*>?/gm, "").slice(0, 150) + "..."}
//                             </p>
//                           </div>

//                           <div className="pt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#C8A64D] uppercase tracking-wider group-hover:translate-x-0.5 transition-all">
//                             <span>Read Article</span>
//                             <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
//                           </div>
//                         </div>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BlogsList;




"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import { blogApi } from "@/api/blog.api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const formatDate = (date, opts) =>
  date ? new Date(date).toLocaleDateString("en-US", opts) : null;

const stripHtml = (html = "") => html.replace(/<[^>]*>?/gm, "");

const readTime = (html = "") => {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const BlogCard = ({ item, isHovered, isRowHovered, onEnter, onLeave }) => {
  const summary =
    item.short_description || stripHtml(item.blog_content).slice(0, 280) + "...";

  return (
    <Link
      href={`/blogs/${item.blog_id}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ flex: isHovered ? "2.4 1 0%" : isRowHovered ? "0.7 1 0%" : "1 1 0%", minWidth: isRowHovered && !isHovered ? "90px" : undefined }}
      className="relative h-[32.5rem] sm:h-[33.75rem] rounded-2xl overflow-hidden bg-stone-900 block
                 transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <img
        src={`${API_URL}${item.blog_image}`}
        alt={item.blog_title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
        style={{ transform: isHovered ? "scale(1.06)" : "scale(1)" }}
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : isRowHovered ? 0.9 : 0.8 }}
      />

      {/* Meta + title — always visible */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
        <div className="flex items-center gap-2.5 text-[0.65625rem] font-semibold uppercase tracking-[0.15em] text-white/70 mb-2.5 whitespace-nowrap overflow-hidden">
          {item.published_date && (
            <span className="flex items-center gap-1.5 shrink-0">
              <CalendarDays size={12} />
              {formatDate(item.published_date, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
          <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
          <span className="flex items-center gap-1.5 shrink-0">
            <Clock3 size={12} />
            {readTime(item.blog_content)} min
          </span>
        </div>

        <h3 className="font-serif text-lg sm:text-[1.35rem] font-bold text-white leading-snug line-clamp-2 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
          {item.blog_title}
        </h3>

        {/* Summary — revealed only on the hovered card, in the space it expands into */}
        <div
          className="grid transition-all duration-500 ease-out"
          style={{
            gridTemplateRows: isHovered ? "1fr" : "0fr",
            opacity: isHovered ? 1 : 0,
            transitionDelay: isHovered ? "150ms" : "0ms",
          }}
        >
          <div className="overflow-hidden min-h-0">
            <p className="pt-3 text-white/85 text-[0.8125rem] sm:text-[0.875rem] leading-relaxed line-clamp-4">
              {summary}
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-[#E8C877] whitespace-nowrap">
              Read full story
              <ArrowUpRight size={14} strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogApi.getAll({ status: "1", limit: 100, sort: "order_no", order: "ASC" });
        const list = res.data?.data || res.data || [];
        setBlogs(list);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#C8A64D]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-[#C8A64D] border-t-transparent animate-spin" />
          </div>
          <p className="text-xs font-medium tracking-wide text-stone-400">Loading articles…</p>
        </div>
      </div>
    );
  }

  const rows = chunk(blogs, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-32 pb-20 sm:pb-28">
        {/* ============ HEADER ============ */}
        <div className="mb-10 sm:mb-14 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#B8894A]">Journal</span>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Stories from the atelier
          </h1>
          <p className="mt-4 text-stone-500 text-sm sm:text-base leading-relaxed">
            Notes on craftsmanship, tailoring traditions, and the fabrics that shape every
            bespoke piece — written by the people who make them.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-24 sm:py-32">
            <p className="font-serif text-xl text-stone-600 italic">The journal is quiet, for now.</p>
            <p className="text-xs font-bold text-[#B8894A] uppercase tracking-[0.25em] mt-3">Check back soon</p>
          </div>
        ) : (
          <>
            {/* ============ DESKTOP/TABLET — accordion rows, 3 per line ============ */}
            <div className="hidden sm:flex flex-col gap-6 sm:gap-8">
              {rows.map((row, rowIdx) => {
                const rowHovered = row.some((item) => item.blog_id === hoveredId);
                return (
                  <div key={rowIdx} className="flex flex-row gap-4 lg:gap-5">
                    {row.map((item) => (
                      <BlogCard
                        key={item.blog_id}
                        item={item}
                        isHovered={hoveredId === item.blog_id}
                        isRowHovered={rowHovered}
                        onEnter={() => setHoveredId(item.blog_id)}
                        onLeave={() => setHoveredId(null)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* ============ MOBILE — simple stacked cards, no hover accordion ============ */}
            <div className="flex sm:hidden flex-col gap-5">
              {blogs.map((item) => {
                const summary =
                  item.short_description || stripHtml(item.blog_content).slice(0, 140) + "...";
                return (
                  <Link
                    key={item.blog_id}
                    href={`/blogs/${item.blog_id}`}
                    className="relative h-[20rem] rounded-2xl overflow-hidden bg-stone-900 block"
                  >
                    <img
                      src={`${API_URL}${item.blog_image}`}
                      alt={item.blog_title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <div className="flex items-center gap-2.5 text-[0.65625rem] font-semibold uppercase tracking-[0.15em] text-white/70 mb-2">
                        {item.published_date && (
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={12} />
                            {formatDate(item.published_date, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={12} />
                          {readTime(item.blog_content)} min
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-white leading-snug line-clamp-2 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
                        {item.blog_title}
                      </h3>
                      <p className="mt-2.5 text-white/85 text-sm leading-relaxed line-clamp-2">
                        {summary}
                      </p>
                      <span className="mt-3.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-[#E8C877]">
                        Read full story
                        <ArrowUpRight size={14} strokeWidth={2.4} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsList;