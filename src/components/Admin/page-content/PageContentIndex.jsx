"use client";
import React, { useState } from 'react';
import WhatIsTab from './WhatIsTab';
import WhyChooseTab from './WhyChooseTab';
import FaqTab from './FaqTab';
import CustomerStoriesTab from './CustomerStoriesTab';

const PAGE_OPTIONS = [
  { value: 'fabric', label: 'Fabric' },
  { value: 'ready-to-wear', label: 'Ready to Wear' },
  { value: 'made-to-wear', label: 'Made to Wear' },
  { value: 'bespoke', label: 'Bespoke' },
];

export default function PageContentIndex() {
  const [activePage, setActivePage] = useState('fabric');
  const [activeTab, setActiveTab] = useState('what_is');

  const selectedPageLabel = PAGE_OPTIONS.find(p => p.value === activePage)?.label;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Page Content Manager</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Editing content for: <strong className="text-slate-800">{selectedPageLabel}</strong>
          </p>
        </div>

        {/* Page Selector Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex overflow-x-auto w-full sm:w-auto mt-4 lg:mt-0">
          {PAGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setActivePage(opt.value)}
              className={`${
                activePage === opt.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              } px-5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="border-b border-stone-200 mt-4">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('what_is')}
            className={`${
              activeTab === 'what_is'
                ? 'border-[#C8A64D] text-[#C8A64D]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-stone-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            What Is In Our {selectedPageLabel}
          </button>
          <button
            onClick={() => setActiveTab('why_choose')}
            className={`${
              activeTab === 'why_choose'
                ? 'border-[#C8A64D] text-[#C8A64D]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-stone-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Why Choose Our {selectedPageLabel}
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`${
              activeTab === 'faq'
                ? 'border-[#C8A64D] text-[#C8A64D]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-stone-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('customer_stories')}
            className={`${
              activeTab === 'customer_stories'
                ? 'border-[#C8A64D] text-[#C8A64D]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-stone-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Customer Stories
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'what_is' && <WhatIsTab pageKey={activePage} />}
        {activeTab === 'why_choose' && <WhyChooseTab pageKey={activePage} />}
        {activeTab === 'faq' && <FaqTab pageKey={activePage} />}
        {activeTab === 'customer_stories' && <CustomerStoriesTab pageKey={activePage} />}
      </div>
    </div>
  );
}
