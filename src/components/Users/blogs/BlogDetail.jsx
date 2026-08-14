"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock3, 
  Share2, 
  Check, 
  Sparkles, 
  User, 
  Tag, 
  Bookmark,
  ChevronRight
} from "lucide-react";
import { blogApi } from "@/api/blog.api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Helper to format image URLs accurately
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// Helper to strip HTML tags for read-time calculation
const stripHtml = (html = "") => html.replace(/<[^>]*>?/gm, "");

const readTime = (html = "") => {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const BlogDetail = ({ id }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await blogApi.getById(id);
        const item = res.data?.data || res.data;
        if (item) {
          setBlog(item);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.blog_title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#C8A64D]/20 border-t-[#C8A64D] animate-spin" />
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Loading Editorial...
          </p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-24 flex flex-col items-center justify-center px-4 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8894A] mb-3">
          Atelier Journal
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
          Story Not Found
        </h2>
        <p className="text-stone-500 text-base mb-8 max-w-md leading-relaxed">
          The article you are searching for may have been archived or moved to another section.
        </p>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-[#B8894A] transition-all duration-300 shadow-md"
        >
          <ArrowLeft size={14} />
          Return to Journal
        </Link>
      </div>
    );
  }

  const featuredImgUrl = getImageUrl(blog.blog_image);

  return (
    <article className="min-h-screen bg-[#FDFBF7] text-stone-800 antialiased selection:bg-[#C8A64D]/20 selection:text-stone-900">
  

      {/* ============ HEADER SECTION ============ */}
<header className="pt-24 sm:pt-32 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">
          
          

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-[1.15] tracking-tight mb-8">
            {blog.blog_title}
          </h1>

         {/* Short Subtitle / Intro Description */}
{blog.short_description && (
  <p className="text-stone-600 text-lg sm:text-xl font-light leading-relaxed mb-8 italic">
    "{blog.short_description}"
  </p>
)}

          {/* Author & Meta Details Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 border-t border-stone-200/80 text-xs sm:text-sm text-stone-500 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-xs font-bold">
                VL
              </div>
              <span className="text-stone-800 font-semibold">
                {blog.author || "VL Editorial Team"}
              </span>
            </div>

            {blog.published_date && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-[#B8894A]" />
                {formatDate(blog.published_date)}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-[#B8894A]" />
              {readTime(blog.blog_content)} min read
            </span>
          </div>
        </div>
      </header>

      {/* ============ FEATURED IMAGE DISPLAY ============ */}
      {featuredImgUrl && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-12 sm:mb-16">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-200/50 group">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative overflow-hidden">
              <img
                src={featuredImgUrl}
                alt={blog.blog_title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            {blog.image_caption && (
              <p className="bg-stone-900/90 text-stone-300 text-xs px-6 py-2.5 text-center font-light tracking-wide border-t border-white/10">
                {blog.image_caption}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ============ MAIN CONTENT AREA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Main Article Text (8 Columns) */}
          <main className="lg:col-span-8 lg:col-start-1">
            <div
              className="rich-text-content space-y-6 text-stone-800 text-lg sm:text-[1.1875rem] leading-[1.85] tracking-normal font-sans"
              dangerouslySetInnerHTML={{ __html: blog.blog_content }}
            />

            {/* Tags / Categories Footer */}
            {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-stone-200 flex items-center gap-3 flex-wrap">
                <Tag size={15} className="text-[#B8894A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mr-2">
                  Tags:
                </span>
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium hover:bg-[#C8A64D]/20 hover:text-stone-900 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </main>

          {/* Sticky Luxury Sidebar Rail (4 Columns) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-8">
            
            {/* Atelier Card */}
            <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-4">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.25em] text-[#B8894A] block">
                Atelier Perspective
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Craftsmanship & Elegance
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                At Vian Luxure, every piece tells a story of dedicated artistry, fine tailoring, and timeless aesthetic standard.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop/bespoke"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-[#B8894A] transition-colors"
                >
                  <span>Explore Tailoring</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Share Box */}
            <div className="p-6 rounded-2xl bg-stone-900 text-white space-y-4 shadow-lg">
              <h4 className="font-serif text-lg font-medium text-white">
                Share this Journal
              </h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                Enjoyed this reading? Share it with fellow sartorial enthusiasts.
              </p>
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 rounded-xl bg-[#C8A64D] hover:bg-white text-stone-900 font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{copied ? "Link Copied" : "Share Article"}</span>
              </button>
            </div>

          </aside>
        </div>
      </section>

     

     
    </article>
  );
};

export default BlogDetail;