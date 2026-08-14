import React from 'react';
import ReviewsIndex from '@/components/Admin/reviews/ReviewsIndex';

export default async function AdminFabricReviewsPage({ params }) {
  // Pass the fabricId from the URL to the ReviewsIndex component
  const resolvedParams = await params;
  return <ReviewsIndex fabricId={resolvedParams.fabricId} />;
}
