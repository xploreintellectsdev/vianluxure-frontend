"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Star } from "lucide-react";

import { searchApi } from "@/api/search.api"; 
import { fabricApi } from "@/api/fabric.api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const SearchSidebar = ({ isOpen, onClose }) => {
  const router = useRouter(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── STATES FOR REAL DB DATA ──
  const [categories, setCategories] = useState([]); // For the circles
  const [filterGroups, setFilterGroups] = useState([]); // For the tags
  const [filtersLoading, setFiltersLoading] = useState(false);

  

  const handleSearchSubmit = (queryToSearch = searchQuery) => {
    if (queryToSearch.trim()) {
      onClose(); 
      router.push(`/search?q=${encodeURIComponent(queryToSearch.trim())}`);
    }
  };

  const handleCategoryClick = (slug) => {
    onClose();
    router.push(`/shop/${slug}`);
  };

  const handleFilterClick = (type, tag) => {
    onClose();
    // Route to the global search page with the tag as the query
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  const handleProductClick = (product) => {
    onClose();
    if (product.product_type === 'ready_to_wear') {
      router.push(`/shop/ready-to-wear/${product.id}`);
    } else {
      router.push(`/shop/fabric/detail/${product.id}`);
    }
  };
  // ── STATES FOR EMPTY VIEW SUGGESTIONS ──
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // ── FETCH EVERYTHING FROM DATABASE WHEN SIDEBAR OPENS ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      const fetchSidebarData = async () => {
        // Skip if already fetched
        if (categories.length > 0 && filterGroups.length > 0) return; 
        
        setFiltersLoading(true);
        setSuggestionsLoading(true);
        try {
          const [filtersRes, newArrRes, bestSelRes] = await Promise.all([
            searchApi.getFilters(),
            fabricApi.getNewArrivals(6),
            fabricApi.getBestSellers(6)
          ]);

          const filtersData = filtersRes?.data?.data || filtersRes?.data || {};
          
          // 1. Setup the Categories (Circles)
          setCategories((filtersData.categories || []).map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            img: c.img ? `${API_URL}${c.img}` : null
          })));

          // 2. Setup the Filter Tags
          const dynamicFilters = [];
          
          const pts = (filtersData.productTypes || []).map(i => i.name);
          // Removed the Category/productType filter as requested by user

          const orgs = (filtersData.origins || []).map(i => i.name);
          if (orgs.length) dynamicFilters.push({ title: "Fabric Origin", type: "origin", tags: orgs });

          const styles = (filtersData.styles || []).map(i => i.name);
          if (styles.length) dynamicFilters.push({ title: "Style", type: "style", tags: styles });

          const colors = (filtersData.colors || []).map(i => i.name);
          if (colors.length) dynamicFilters.push({ title: "Color", type: "color", tags: colors });

          const patterns = (filtersData.patterns || []).map(i => i.name);
          if (patterns.length) dynamicFilters.push({ title: "Pattern", type: "pattern", tags: patterns });

          setFilterGroups(dynamicFilters);

          // 3. Setup suggestions
          const mapProduct = (item) => ({
            id: item.fab_id,
            product_type: 'fabric',
            name: item.fab_name,
            colorDesc: item.fab_short_desc || "Premium Fabric",
            price: Number(item.fab_price_per_meter),
            image: item.fab_cover_image ? `${API_URL}${item.fab_cover_image}` : null,
            rating: 4.8
          });

          setNewArrivals((newArrRes?.data?.data || newArrRes?.data || []).map(mapProduct));
          setBestSellers((bestSelRes?.data?.data || bestSelRes?.data || []).map(mapProduct));

        } catch (error) {
          console.error("Failed to fetch sidebar data", error);
        } finally {
          setFiltersLoading(false);
          setSuggestionsLoading(false);
        }
      };
      
      fetchSidebarData();
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
    }
  }, [isOpen, categories.length, filterGroups.length]);

  // ── REAL BACKEND FETCHING FOR PRODUCTS ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await searchApi.getResults(searchQuery);
        const rawData = res.data?.data || res.data || [];
        
        const mappedData = rawData.map(item => ({
          id: item.id,
          product_type: item.product_type,
          name: item.name,
          colorDesc: item.short_desc || item.category_name || "Premium Fabric",
          colorsAvailable: 1, 
          price: Number(item.price) + 200, 
          discountPrice: Number(item.price), 
          rating: 4.8, 
          image: item.cover_image ? `${API_URL}${item.cover_image}` : null
        }));

        setSearchResults(mappedData);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 400); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderProductGrid = (products, title) => (
    <div className="mb-10">
      <h3 className="text-sm font-bold text-gray-900 mb-4 px-6 sm:px-8">{title}</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 sm:px-8 pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group flex flex-col w-40 sm:w-48 shrink-0 snap-start rounded-2xl bg-white p-2 shadow-sm ring-1 ring-text-border/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-category-gold/10 hover:ring-category-gold/30 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* IMAGE CONTAINER */}
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#F4EFE8]">
              {product.image ? (
                 <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110" />
              ) : (
                 <span className="text-gray-400 font-semibold text-4xl uppercase flex items-center justify-center h-full transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110">{product.name[0]}</span>
              )}
              {/* Subtle Dark Overlay on Hover */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
            </div>

            {/* DETAILS */}
            <div className="flex flex-col flex-1 pt-3 px-1 pb-1">
              <div className="flex-1">
                <h3 className="text-xs sm:text-[0.8125rem] font-bold text-text-primary leading-tight group-hover:text-category-gold transition-colors duration-300 truncate">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[0.625rem] sm:text-[0.6875rem] font-medium text-text-primary/50 uppercase tracking-wide truncate">
                  {product.colorDesc}
                </p>
              </div>

              <p className="mt-2 text-xs sm:text-[0.8125rem] font-extrabold text-category-gold">
                ₹ {(product.discountPrice || product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100000]"
          />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-lg bg-white z-[100001] shadow-2xl flex flex-col text-black"
          >
            <button
              type="button" onClick={onClose}
              className="absolute right-6 top-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-20 min-w-10 min-h-10 flex items-center justify-center"
            >
              <X size={20} className="text-gray-600 pointer-events-none" />
            </button>

            {/* --- HEADER --- */}
            <div className="relative pt-10 px-6 sm:px-8 pb-6 border-b border-gray-100 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Search</h2>
              <div className="relative flex items-center">
                <button onClick={() => handleSearchSubmit()} className="absolute left-4 text-gray-400 hover:text-gray-900 transition-colors min-w-10 min-h-10 flex items-center justify-center">
                  <Search size={18} />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                  placeholder="Search for products..."
                  className="w-full bg-gray-50 h-12 pl-12 pr-4 rounded-md outline-none text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-gray-400 transition-colors text-sm sm:text-base"
                  autoFocus
                />
              </div>
            </div>

            {/* --- SCROLLABLE BODY --- */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
              {!searchQuery.trim() ? (
                <div className="animate-in fade-in duration-300">
                  
                  {/* ── SHOP BY CATEGORY (CIRCLES) ── */}
                  <div className="px-6 sm:px-8 py-8 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-6">Shop by Fabric category:</h3>
                    
                    {filtersLoading ? (
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                        ))}
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
                        {categories.map((cat) => (
                          <div key={cat.id} onClick={() => handleCategoryClick(cat.slug)} className="flex-shrink-0 cursor-pointer group flex flex-col items-center">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-gray-200 group-hover:border-black transition-all bg-[#F4EFE8] flex items-center justify-center shadow-sm">
                              {cat.img ? (
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
                              ) : (
                                <span className="text-gray-400 font-bold text-2xl uppercase transition-transform duration-500 ease-out group-hover:scale-110">{cat.name[0]}</span>
                              )}
                            </div>
                            <span className="mt-3 text-xs sm:text-sm font-semibold text-gray-800 tracking-wide text-center leading-tight transition-colors duration-300 group-hover:text-black px-1">
                              {cat.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No categories found.</p>
                    )}
                  </div>

                  {/* ── FILTER TAGS (DYNAMIC FROM DB) ── */}
                  {filterGroups.length > 0 && (
                    <div className="px-6 sm:px-8 py-8 border-t border-gray-100">                      
                      {filtersLoading ? (
                         <div className="space-y-6">
                           {[1, 2, 3].map(i => (
                             <div key={i}>
                               <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mb-3" />
                               <div className="flex gap-2">
                                 <div className="w-16 h-8 bg-gray-100 animate-pulse rounded-full" />
                                 <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-full" />
                                 <div className="w-14 h-8 bg-gray-100 animate-pulse rounded-full" />
                               </div>
                             </div>
                           ))}
                         </div>
                      ) : (
                        <div className="space-y-8">
                          {filterGroups.map((group, i) => (
                            <div key={i}>
                              <h4 className="text-sm font-bold text-gray-900 mb-3">{group.title} :</h4>
                              <div className="flex flex-wrap gap-2.5">
                                {group.tags.map((tag, j) => (
                                  <button 
                                    key={j} 
                                    type="button" 
                                    onClick={() => handleFilterClick(group.type, tag)} 
                                    className="px-5 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-colors bg-white min-h-10"
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SUGGESTIONS (NEW ARRIVALS / BEST SELLERS) ── */}
                  <div className="pb-24">
                    {!suggestionsLoading && newArrivals.length > 0 && (
                      <div className="pt-8 border-t border-gray-100">
                        {renderProductGrid(newArrivals, "New Arrivals")}
                      </div>
                    )}
                    {!suggestionsLoading && bestSellers.length > 0 && (
                      <div className="pt-2">
                        {renderProductGrid(bestSellers, "Best Sellers")}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300 flex flex-col min-h-full pb-24">
                  <div className="px-6 sm:px-8 py-6">
                    <h3 className="text-sm font-bold text-gray-900">{isLoading ? "Searching..." : "Products:"}</h3>
                  </div>

                  <div className="grid grid-cols-2 bg-gray-200 gap-px border-y border-gray-200">
                    {searchResults.map((product) => (
                      <div key={product.id} className="bg-white flex flex-col group cursor-pointer" onClick={() => handleProductClick(product)}>
                        <div className="w-full aspect-[3/4] overflow-hidden bg-[#F4EFE8] relative flex items-center justify-center">
                          {product.image ? (
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                             <span className="text-gray-400 font-semibold text-5xl uppercase">{product.name[0]}</span>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Available in {product.colorsAvailable} colors</p>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{product.name}</h3>
                              <div className="flex items-center text-[0.6875rem] text-gray-900 font-semibold mt-0.5 min-w-fit">
                                <span className="mr-0.5">{product.rating}</span>
                                <Star size={11} className="fill-black text-black" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{product.colorDesc}</p>
                          </div>

                          <div className="mt-4 flex flex-col">
                            {product.discountPrice && product.discountPrice < product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹ {product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </p>
                            )}
                            <p className="text-sm text-gray-900 font-bold mt-0.5">
                              ₹ {(product.discountPrice || product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isLoading && searchResults.length === 0 && (
                    <div className="p-12 text-center text-gray-500 font-medium">
                      No products found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- STICKY FOOTER BUTTON --- */}
            {searchQuery && searchResults.length > 0 && !isLoading && (
              <div className="absolute bottom-0 w-full bg-white p-6 sm:p-8 border-t border-gray-100 shrink-0 pb-safe">
                <button onClick={() => handleSearchSubmit()} className="w-full bg-black text-white py-4 text-sm font-bold tracking-[0.2em] rounded-sm hover:bg-gray-800 transition-all uppercase min-h-12">
                  View all {searchResults.length} results
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchSidebar;