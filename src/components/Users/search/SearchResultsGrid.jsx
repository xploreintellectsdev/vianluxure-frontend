"use client";

import Link from "next/link";

export default function SearchResultsGrid({ products = [], loading = false, query = "" }) {

  return (
    <section className="px-4 md:px-8 pb-20">
      <div className="max-w-[100rem] mx-auto bg-[#f9f9f9] rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 shadow-sm min-h-[25rem]">
        
        {/* ── LOADING STATE (Skeletons) ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 flex flex-col items-center h-full">
                <div className="w-full aspect-square rounded-xl bg-gray-200 animate-pulse mb-4" />
                <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="w-1/2 h-3 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── SUCCESS STATE (Show Products) ── */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                href={product.product_type === 'ready_to_wear' ? `/shop/ready-to-wear/${product.id}` : `/shop/fabric/detail/${product.id}`}
                key={`${product.product_type}-${product.id}`} 
                className="bg-white rounded-2xl p-3 flex flex-col items-center group cursor-pointer hover:shadow-md transition-shadow h-full"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#F4EFE8] mb-4 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <span className="text-gray-400 font-semibold text-5xl uppercase">
                      {product.name?.[0] ?? "?"}
                    </span>
                  )}
                </div>

                {/* Centered Text Info */}
                <div className="text-center pb-2 w-full px-2">
                  <h3 className="text-[0.875rem] font-medium text-gray-800 mb-1 truncate">
                    {product.name}
                  </h3>
                  
                  <div className="flex flex-col items-center justify-center">
                    {product.discountPrice && product.discountPrice < product.price && (
                      <span className="text-[0.6875rem] text-gray-400 line-through mb-0.5">
                        ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    <p className="text-[0.8125rem] text-gray-900 font-bold">
                      ₹{(product.discountPrice || product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      {product.product_type === 'fabric' && "/meter"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE (No Results) ── */}
        {!loading && products.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-gray-900 font-serif text-2xl mb-2">No results found</h3>
            <p className="text-gray-500">We couldn't find any products matching "{query}".</p>
          </div>
        )}

      </div>
    </section>
  );
}