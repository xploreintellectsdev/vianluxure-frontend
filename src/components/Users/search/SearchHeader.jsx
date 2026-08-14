"use client";

import { motion } from "framer-motion";

export default function SearchHeader({ query, count, activeTab, setActiveTab }) {
  const tabs = ["All", "Products", "Collections"];

  return (
    <section className="pt-24 pb-12 flex flex-col items-center text-center">
      {/* Subtitle */}
      <p className="text-[0.75rem] uppercase tracking-[0.4em] text-gray-500 mb-2 font-medium">
        Search Result For
      </p>
      
      {/* Main Title (Serif) */}
      <h1 className="text-5xl md:text-6xl font-serif text-[#1a1a1a] mb-8 capitalize">
        {query}
      </h1>

      {/* --- TABS / PILLS --- */}
      <div className="flex items-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-1.5 rounded-full text-[0.8125rem] transition-all duration-300 border ${
              activeTab === tab 
                ? "bg-[#c5a059] border-[#c5a059] text-white shadow-md" 
                : "bg-white border-gray-200 text-gray-500 hover:border-[#c5a059]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <p className="mt-6 font-mono text-[0.6875rem] text-gray-400 uppercase tracking-widest">
        {count} items found
      </p>
    </section>
  );
}