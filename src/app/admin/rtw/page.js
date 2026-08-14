"use client"; // ── FIX: Added this line! ──

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the component and disable SSR to prevent Hydration errors
const RtwIndex = dynamic(
  () => import('@/components/Admin/ready-to-wear/RtwIndex'),
  { ssr: false } 
);

const Page = () => {
  return (
    <div>
        <RtwIndex />
    </div>
  )
}

export default Page;