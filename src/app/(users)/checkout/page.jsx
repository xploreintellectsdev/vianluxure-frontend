// src/app/checkout/page.jsx
import { Suspense } from 'react';
import CheckoutContent from '@/components/Users/checkout/CheckoutContent';

export default function CheckoutPage() {
  return (
    <main>
      <Suspense fallback={<div className="bg-[#FAFAF8] min-h-screen py-24 px-4" />}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}