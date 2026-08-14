"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import ContactHeroTab from './ContactHeroTab';
import ContactInfoTab from './ContactInfoTab';
import ContactSubmissionsTab from './ContactSubmissionsTab';

const ContactPageIndex = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'hero');

  useEffect(() => {
    if (tabParam && ['hero', 'info', 'submissions'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C8A64D]/10 flex items-center justify-center border border-[#C8A64D]/20 shadow-inner">
            <Mail className="w-6 h-6 text-[#C8A64D]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Contact Page</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage contact hero, info cards, map embed, and view submissions</p>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {activeTab === 'hero' && <ContactHeroTab />}
        {activeTab === 'info' && <ContactInfoTab />}
        {activeTab === 'submissions' && <ContactSubmissionsTab />}
      </div>
    </div>
  );
};

export default ContactPageIndex;
