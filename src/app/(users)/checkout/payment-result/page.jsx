import { Suspense } from 'react';
import PaymentResultContent from "@/components/Users/checkout/PaymentResultContent";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="bg-[#FAFAF8] min-h-screen py-24 px-4 flex items-center justify-center">Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
