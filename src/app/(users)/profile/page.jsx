"use client";

import React, { useEffect, useState } from 'react';
import ProfileHero from '@/components/Users/profile/profilehero';
import Profile from '@/components/Users/profile/profileform';
import { useAuthContext } from '@/components/Users/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [initialProfileData, setInitialProfileData] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Split name for firstName / lastName
    const nameParts = user.name ? user.name.split(' ') : [''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    setInitialProfileData({
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email || '',
      mobile: user.mobile || '',
      profilePic: user.profile_pic || null,
    });
  }, [user]);
  
  if (!user) {
    return <div className="min-h-screen bg-[#070e17] text-white flex items-center justify-center pt-28">Please log in to view your profile.</div>;
  }

  if (!initialProfileData) {
    return <div className="min-h-screen bg-[#070e17] flex items-center justify-center pt-28">
      <div className="w-8 h-8 border-4 border-[#C8A64D] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <main>
      <Profile initialData={initialProfileData} />
    </main>
  );
}