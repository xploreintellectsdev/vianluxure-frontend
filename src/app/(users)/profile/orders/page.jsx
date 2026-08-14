"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProfileOrders from "@/components/Users/profile/ProfileOrders";
import { useAuthContext } from "@/components/Users/context/AuthContext";

export default function UserOrdersPage() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#ececea] text-black flex items-center justify-center pt-28">
        <div className="text-center">
          <p className="text-sm uppercase font-semibold tracking-widest mb-4">Please log in to view your orders.</p>
          <Link href="/auth" className="text-[#C8A64D] hover:underline text-xs font-bold uppercase tracking-widest">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececea] pt-28 md:pt-36 pb-20 px-4 sm:px-6 md:px-12 lg:px-16 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-[0.5625rem] sm:text-[0.625rem] text-black/50 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link href="/profile" className="hover:text-black transition">Profile</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-[#C8A64D]">Your Orders</span>
        </div>

        {/* Full Orders Grid */}
        <ProfileOrders compact={false} />
      </div>
    </div>
  );
}
