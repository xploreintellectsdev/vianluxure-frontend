import AboutHero from '@/components/Users/aboutus/aboutHero';
import WhoWeAre from '@/components/Users/aboutus/WhoWeAre';
import VisionMission from '@/components/Users/aboutus/VisionMission';
import WhatWeDo from '@/components/Users/aboutus/WhatWeDo';

export const metadata = {
  title: "About Us | Vian Luxure",
  description: "Learn more about Vian Luxure's vision, mission, and bespoke process.",
};

async function getAboutPageData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/about-page/with-items?activeOnly=true`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch about page data:", error);
    return [];
  }
}

export default async function AboutUsPage() {
  const sections = await getAboutPageData();

  // Create a dictionary for quick lookup by section_key, normalizing case and spaces
  const sectionMap = {};
  sections.forEach(sec => {
    if (sec.section_key) {
      const normalizedKey = sec.section_key.trim().toLowerCase().replace(/\s+/g, '-');
      sectionMap[normalizedKey] = sec;
      // Also keep original just in case
      sectionMap[sec.section_key] = sec;
    }
  });

  const getSection = (...keys) => {
    for (const key of keys) {
      if (!key) continue;
      const match = sectionMap[key] || sectionMap[`about-${key}`] || sectionMap[key.replace('about-', '')];
      if (match) return match;
    }
    return null;
  };

  return (
    <main>
      <AboutHero data={getSection('about-hero', 'hero')} />
      <WhoWeAre data={getSection('about-who-we-are', 'who-we-are', 'who-are-we')} />
      <VisionMission 
        vision={getSection('about-vision', 'vision', 'our-vision')} 
        mission={getSection('about-mission', 'mission', 'our-mission')} 
        gallery={getSection('about-gallery-marquee', 'gallery', 'gallery-marquee')} 
      />
      <WhatWeDo 
        intro={getSection('about-what-we-do', 'what-we-do', 'our-process')} 
        bespoke={getSection('about-bespoke-how-it-works', 'bespoke-how-it-works', 'bespoke', 'how-it-works')} 
      />
    </main>
  );
}