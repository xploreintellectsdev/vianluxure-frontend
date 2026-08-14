'use client';

import { LogOut } from 'lucide-react';

import { useAuthContext } from '@/components/Users/context/AuthContext';
import { useRouter } from 'next/navigation';
import showToast from '@/sharables/toast';

// Backend may return a relative path (e.g. "/uploads/profile/123.png").
// Prefix it with the API origin so <img> doesn't try to load it from the frontend's own origin.
const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

const ProfileHero = () => {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const name = user?.name || 'User Name';
  const email = user?.email || 'user@email.com';
  const profilePic = resolveImageUrl(user?.profile_pic || user?.profilePic || null);
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    showToast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between max-w-7xl mx-auto px-3 sm:px-6 md:px-12 pt-8 sm:pt-12">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#C8A64D] flex items-center justify-center text-black font-bold text-lg shrink-0 overflow-hidden">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            initial
          )}
        </div>
        <div>
          <h1 className="font-serif text-xl sm:text-2xl text-black leading-tight">
            Welcome back, {name}
          </h1>
          <p className="text-xs text-black/50">{email}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/70 hover:text-[#C0202B] transition"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
};

export default ProfileHero;