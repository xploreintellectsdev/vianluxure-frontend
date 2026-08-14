"use client";
import React, { useState } from 'react';
import { Layers, Type } from 'lucide-react';
import SlidesTab from './SlidesTab';
import MarqueeTab from './MarqueeTab';

export default function HeroIndex() {
  const [activeTab, setActiveTab] = useState('slides');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">Hero Section</h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Manage the dynamic content for the home page hero.</p>
      </div>

      <div className="flex border-b border-stone-200">
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'slides' ? 'border-[#C8A64D] text-[#C8A64D]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('slides')}
        >
          <Layers size={18} />
          Slides
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'marquee' ? 'border-[#C8A64D] text-[#C8A64D]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('marquee')}
        >
          <Type size={18} />
          Marquee Strip
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'slides' && <SlidesTab />}
        {activeTab === 'marquee' && <MarqueeTab />}
      </div>
    </div>
  );
}
