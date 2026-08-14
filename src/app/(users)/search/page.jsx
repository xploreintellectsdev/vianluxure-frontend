"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import SearchHeader from "../../../components/Users/search/SearchHeader";
import SearchResultsGrid from "../../../components/Users/search/SearchResultsGrid";
import { searchApi } from "@/api/search.api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Inner component to handle Search Params logic
function SearchContent() {
  const [activeTab, setActiveTab] = useState("All");
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; 
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchApi.getResults(query);
        const rawData = res.data?.data || res.data || [];
        
        const mappedData = rawData.map(item => ({
          id: item.id,
          product_type: item.product_type,
          name: item.name,
          category: item.product_type === 'ready_to_wear' ? 'Ready to Wear' : 'Fabric',
          price: Number(item.price) + 200, 
          discountPrice: Number(item.price), 
          image: item.cover_image ? `${API_URL}${item.cover_image}` : null
        }));
        
        setProducts(mappedData);
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  // Filter based on active tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === "All") return true;
    if (activeTab === "Fabrics" && product.product_type === "fabric") return true;
    if (activeTab === "Collections" && product.product_type === "ready_to_wear") return true;
    return false;
  });

  return (
    <>
      <SearchHeader 
        query={query || "Products"} 
        count={filteredProducts.length} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <SearchResultsGrid 
        products={filteredProducts} 
        loading={loading}
        query={query}
      />
    </>
  );
}

// Main Export
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] selection:bg-[#c5a059] selection:text-white">
      <Suspense fallback={<div className="pt-40 text-center">Loading search results...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}