"use client";
import { Suspense } from 'react';
import AddressContent from '@/components/Users/checkout/address/AddressContent';

// This page renders the "Address & Payment" screen (Step 2)
export default function AddressPage() {
    return (
        <Suspense fallback={<div className="bg-[#FAFAF8] min-h-screen py-24 px-4" />}>
            <AddressContent />
        </Suspense>
    );
}