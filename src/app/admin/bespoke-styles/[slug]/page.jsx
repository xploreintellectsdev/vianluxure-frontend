import React from 'react';
import CustomStyleIndex from '@/components/Admin/custom-styles/customStyleIndex';

export default async function BespokeStylePage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Basic capitalization for the label
  const typeLabel = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');

  return <CustomStyleIndex type={slug} typeLabel={typeLabel} />;
}
