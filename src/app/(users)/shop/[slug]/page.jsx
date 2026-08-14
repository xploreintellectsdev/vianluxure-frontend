"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fabricCategoryApi } from "@/api/fabricCategory.api"; // Imorting your API

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function formatPrice(value) {
  return `₹${Number(value).toLocaleString("en-IN")}.00`;
}

// Maps your exact database columns to the frontend
function mapProduct(p) {
  return {
    _id: p.fab_id,
    name: p.fab_name ?? "Unnamed Fabric",
    price: p.fab_price_per_meter ?? 0,
    categoryName: p.fc_name ?? "",
    // ── FIX: prepend API_URL so the image actually loads, same fix as ProductSell ──
    image: p.fab_cover_image ? `${API_URL}${p.fab_cover_image}` : "",
    link: `/shop/fabric/detail/${p.fab_id}`,
  };
}

export default function CategoryProductsPage() {
  const params = useParams();
  const categorySlug = params.slug; // e.g., "jerseys"

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Using the new API function you just created!
      const res = await fabricCategoryApi.getFabricsBySlug(categorySlug);

      let raw = [];
      if (Array.isArray(res)) raw = res;
      else if (Array.isArray(res?.data)) raw = res.data;
      else if (Array.isArray(res?.data?.data)) raw = res.data.data;

      const mapped = raw.map(mapProduct);
      setProducts(mapped);

      // Extract real category name from the first product if it exists
      if (raw.length > 0 && raw[0].fc_name) {
        setCategoryName(raw[0].fc_name);
      } else {
        // Fallback: turn "jerseys" into "Jerseys"
        setCategoryName(categorySlug.replace("-", " "));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load fabrics for this category.");
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchProducts();
    });
    return () => {
      ignore = true;
    };
  }, [categorySlug, fetchProducts]);

  return (
    <div className="min-h-screen bg-page-bg pt-[clamp(5rem,11vw,7.5rem)] pb-12 sm:pb-16 lg:pb-20">
      <div className="mx-auto w-full max-w-[120rem] px-4 sm:px-6 md:px-8 lg:px-[clamp(1.5rem,3vw,4rem)]">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8 lg:mb-10 text-center px-2">
          <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold capitalize text-category-gold mb-2 break-words">
            {categoryName}
          </h1>
          <p className="text-text-subtle text-base sm:text-base">
            Explore our exclusive collection of {categoryName}.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full animate-pulse rounded-2xl bg-text-border/5 p-3">
                <div className="aspect-[3/4] w-full rounded-xl bg-text-border/10"></div>
                <div className="mt-4 h-5 w-3/4 rounded-md bg-text-border/10"></div>
                <div className="mt-2 h-4 w-1/2 rounded-md bg-text-border/10"></div>
                <div className="mt-4 h-6 w-1/3 rounded-md bg-text-border/10"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-10 text-sm sm:text-base">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-text-subtle py-10 text-base sm:text-lg">
            No fabrics found in this category yet.
          </p>
        ) : (
          /* PRODUCT GRID */
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product._id}
                href={product.link}
                className="group flex flex-col rounded-2xl bg-white p-[clamp(0.5rem,1vw,0.75rem)] shadow-sm ring-1 ring-text-border/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-category-gold/10 hover:ring-category-gold/30"
              >
                {/* IMAGE CONTAINER */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#F4EFE8]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold uppercase text-3xl">
                      {product.name[0] ?? "?"}
                    </div>
                  )}

                  {/* Subtle Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />

                  {/* Hover Badge */}
                  <div className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="rounded-full bg-white/95 px-5 py-2.5 text-[0.75rem] font-bold uppercase tracking-widest text-black backdrop-blur-sm shadow-lg">
                      View Fabric
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="flex flex-col flex-1 pt-4 px-2 pb-2">
                  <div className="flex-1">
                    <h3 className="text-[clamp(1rem,1.2vw,1.15rem)] font-bold text-text-primary leading-tight group-hover:text-category-gold transition-colors duration-300 truncate">
                      {product.name}
                    </h3>
                    {product.categoryName && (
                      <p className="mt-1 text-[clamp(0.8rem,1vw,0.9rem)] font-medium text-text-primary/50 uppercase tracking-wide">
                        {product.categoryName}
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-[clamp(1.1rem,1.4vw,1.25rem)] font-extrabold text-category-gold">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}