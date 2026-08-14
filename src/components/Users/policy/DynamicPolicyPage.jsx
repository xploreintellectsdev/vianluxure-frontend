'use client';
import React, { useEffect, useState } from 'react';
import { policyApi } from '@/api/policy.api';
import { renderPolicyContent } from '@/utils/renderPolicyContent';
import Link from 'next/link';
import { PolicyIcon as Icon } from './PolicyIcon';

/* ─────────────────────────────────────────────
   Policy Card — main-grid & footer-grid
───────────────────────────────────────────── */
const PolicyCard = ({ icon, title, children }) => (
  <div
    className="rounded-2xl border p-8 md:p-10 transition-all duration-300 hover:shadow-lg w-full"
    style={{ borderColor: 'rgba(201, 162, 93, 0.35)', background: '#FFFDF7' }}
  >
    <div className="flex items-start gap-4 mb-5">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
        style={{ background: 'rgba(201, 162, 93, 0.14)', borderColor: 'rgba(201, 162, 93, 0.4)', color: '#9c7a35' }}
      >
        <Icon name={icon} />
      </div>
      {title && (
        <h3
          className="pt-2 text-xl md:text-2xl font-semibold tracking-tight"
          style={{ color: '#1a1611', fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          {title}
        </h3>
      )}
    </div>
    <div className="space-y-3 text-[0.9375rem] leading-relaxed [&_strong]:font-semibold" style={{ color: '#4a4238' }}>
      {children}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Stat Card — stats group
   Alternates between dark (#141210) and light (#FDF9EF) by index
───────────────────────────────────────────── */
const StatCard = ({ stat, index }) => {
  const isDark = index % 2 === 0;
  if (isDark) {
    return (
      <div className="rounded-3xl p-9 text-center border" style={{ background: '#141210', borderColor: 'rgba(201,162,93,0.35)' }}>
        <p className="text-5xl md:text-6xl font-bold" style={{ color: '#dcb96a' }}>{stat.stat_value}</p>
        <p className="text-sm mt-2 tracking-widest uppercase" style={{ color: 'rgba(253,249,239,0.5)' }}>{stat.stat_unit}</p>
        <p className="mt-5 font-semibold text-lg" style={{ color: '#FDF9EF' }}>{stat.stat_label}</p>
        {stat.stat_caption && <p className="text-sm mt-1" style={{ color: 'rgba(253,249,239,0.55)' }}>{stat.stat_caption}</p>}
      </div>
    );
  }
  return (
    <div className="rounded-3xl p-9 text-center border" style={{ borderColor: 'rgba(201, 162, 93, 0.4)', background: '#FDF9EF' }}>
      <p className="text-5xl md:text-6xl font-bold" style={{ color: '#9c7a35' }}>{stat.stat_value}</p>
      <p className="text-sm mt-2 tracking-widest uppercase" style={{ color: '#8a7c63' }}>{stat.stat_unit}</p>
      <p className="mt-5 font-semibold text-lg" style={{ color: '#1a1611' }}>{stat.stat_label}</p>
      {stat.stat_caption && <p className="text-sm mt-1" style={{ color: '#6b6255' }}>{stat.stat_caption}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div className="w-full min-h-screen bg-[#FFFCF5]">
    <div className="h-72 bg-[#141210] animate-pulse" />
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-48 rounded-2xl bg-stone-100 animate-pulse" />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function DynamicPolicyPage({ pageKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await policyApi.getPageByKey(pageKey, { activeOnly: true });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageKey]);

  if (loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-[#FFFCF5] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-serif text-stone-800 mb-4">Policy Not Found</h1>
        <p className="text-stone-500 mb-8">The policy you are looking for does not exist or is currently inactive.</p>
        <Link href="/" className="text-stone-800 hover:text-stone-600 font-semibold underline">Return Home</Link>
      </div>
    );
  }

  const { hero_eyebrow, hero_title, hero_subtitle, intro_note, sections } = data;
  const mainGrid = sections?.['main-grid'] || [];
  const stats = sections?.['stats'] || [];
  const footerGrid = sections?.['footer-grid'] || [];

  return (
    <section className="w-full" style={{ background: '#FFFCF5' }}>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <div
        className="relative text-center px-6 pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden"
        style={{ background: '#141210' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,162,93,0.16) 0%, transparent 60%)' }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-10" style={{ background: '#c9a25d' }} />
            <Icon name="crown" className="w-6 h-6" style={{ color: '#c9a25d' }} />
            <span className="h-px w-10" style={{ background: '#c9a25d' }} />
          </div>
          <p className="text-xs md:text-sm font-medium uppercase tracking-[0.3em] mb-5" style={{ color: '#c9a25d' }}>
            {hero_eyebrow}
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            style={{ color: '#FDF9EF', fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            {hero_title}
          </h1>
          {hero_subtitle && (
            <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(253, 249, 239, 0.72)' }}>
              {hero_subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ═══════════════════ INTRO NOTE ═══════════════════ */}
      {intro_note && (
        <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 mb-10">
          <div
            className="rounded-2xl px-7 py-6 text-sm md:text-[0.9375rem] leading-relaxed border shadow-sm whitespace-pre-wrap"
            style={{ borderColor: 'rgba(201, 162, 93, 0.4)', background: '#FDF9EF', color: '#3d362c' }}
          >
            {intro_note}
          </div>
        </div>
      )}

      {/* ═══════════════════ MAIN GRID ═══════════════════ */}
      {mainGrid.length > 0 && (
        <div className={`max-w-5xl mx-auto px-6 ${intro_note ? 'pb-4' : '-mt-8 relative z-10 pb-4'}`}>
          {mainGrid.length > 1 ? (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col gap-6">
                {mainGrid.filter((_, i) => i % 2 === 0).map((card) => (
                  <PolicyCard key={card.section_id} icon={card.icon} title={card.title}>
                    {renderPolicyContent(card.content)}
                  </PolicyCard>
                ))}
              </div>
              <div className="flex flex-col gap-6">
                {mainGrid.filter((_, i) => i % 2 !== 0).map((card) => (
                  <PolicyCard key={card.section_id} icon={card.icon} title={card.title}>
                    {renderPolicyContent(card.content)}
                  </PolicyCard>
                ))}
              </div>
            </div>
          ) : (
            mainGrid.map((card) => (
              <PolicyCard key={card.section_id} icon={card.icon} title={card.title}>
                {renderPolicyContent(card.content)}
              </PolicyCard>
            ))
          )}
        </div>
      )}

      {/* ═══════════════════ STATS (Time to Deliver) ═══════════════════ */}
      {stats.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="h-px w-8" style={{ background: 'rgba(201,162,93,0.5)' }} />
            <Icon name="clock" className="w-5 h-5" style={{ color: '#9c7a35' }} />
            <h2
              className="text-2xl md:text-3xl font-semibold tracking-tight"
              style={{ color: '#1a1611', fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              Time to Deliver
            </h2>
            <span className="h-px w-8" style={{ background: 'rgba(201,162,93,0.5)' }} />
          </div>
          <div className={`grid sm:grid-cols-${Math.min(stats.length, 3)} gap-6`}>
            {stats.map((stat, i) => (
              <StatCard key={stat.section_id} stat={stat} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ FOOTER GRID ═══════════════════ */}
      {footerGrid.length > 0 && (
        <div className={`max-w-5xl mx-auto px-6 pb-20 ${footerGrid.length === 1 ? 'mt-4 pb-14' : ''}`}>
          {footerGrid.length > 1 ? (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col gap-6">
                {footerGrid.filter((_, i) => i % 2 === 0).map((card) => (
                  <PolicyCard key={card.section_id} icon={card.icon} title={card.title}>
                    {renderPolicyContent(card.content)}
                  </PolicyCard>
                ))}
              </div>
              <div className="flex flex-col gap-6">
                {footerGrid.filter((_, i) => i % 2 !== 0).map((card) => (
                  <PolicyCard key={card.section_id} icon={card.icon} title={card.title}>
                    {renderPolicyContent(card.content)}
                  </PolicyCard>
                ))}
              </div>
            </div>
          ) : (
            footerGrid.map((card) => (
              <PolicyCard key={card.section_id} icon={card.icon} title={card.title}>
                {renderPolicyContent(card.content)}
              </PolicyCard>
            ))
          )}
        </div>
      )}

      {/* Bottom padding when no footer grid */}
      {footerGrid.length === 0 && mainGrid.length > 0 && <div className="pb-14" />}

    </section>
  );
}
