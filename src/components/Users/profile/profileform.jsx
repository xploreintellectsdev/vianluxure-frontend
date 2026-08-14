'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, ArrowRight, X, Check } from 'lucide-react';
import ProfileOrders from './ProfileOrders';
import ProfileAddress from './ProfileAddress';
import { useAuthContext } from '@/components/Users/context/AuthContext';
import { userApi } from '@/api/user.api';
import ProfileHero from './profilehero';

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

const ProfileForm = ({ initialData = {} }) => {
  const { user, updateUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profilePic, setProfilePic] = useState(initialData.profilePic || user?.profile_pic || null);
  const [profileFile, setProfileFile] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
  });

  // Keep form data in sync with AuthContext user
  useEffect(() => {
    if (user) {
      const rawName = user.name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      const [first = '', ...rest] = rawName.trim().split(' ');

      setFormData({
        firstName: first,
        lastName: rest.join(' '),
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
      });
      setProfilePic(user.profile_pic || user.profilePic || null);
    }
  }, [user]);

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStartEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMessage({ text: '', type: '' });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      const rawName = user.name || user.full_name || '';
      const [first = '', ...rest] = rawName.trim().split(' ');
      setFormData({
        firstName: first,
        lastName: rest.join(' '),
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
      });
      setProfilePic(user.profile_pic || user.profilePic || null);
      setProfileFile(null);
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e, customOtp = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: '', type: '' });

    // If email has changed, trigger OTP verification to the new email first
    const currentDbEmail = (user?.email || '').trim().toLowerCase();
    const newEmail = (formData.email || '').trim().toLowerCase();
    const isEmailChanging = newEmail && newEmail !== currentDbEmail;

    if (isEmailChanging && !customOtp && !showOtpModal) {
      try {
        await userApi.sendEmailChangeOtp({ email: formData.email });
        setShowOtpModal(true);
        setMessage({ text: `Verification code sent to ${formData.email}. Please verify to save changes.`, type: 'success' });
      } catch (error) {
        setMessage({
          text: error.response?.data?.message || error.message || 'Failed to send verification code.',
          type: 'error',
        });
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    try {
      let finalPicUrl = user?.profile_pic || user?.profilePic || null;

      if (profileFile) {
        const uploadData = new FormData();
        uploadData.append('profileImage', profileFile);
        const uploadRes = await userApi.uploadProfilePic(uploadData);
        if (uploadRes && (uploadRes.success || uploadRes.url)) {
          finalPicUrl = uploadRes.url || uploadRes.data?.url;
        }
      }

      const formattedFullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Send payload supporting multiple naming conventions (camelCase & snake_case)
      const updatePayload = {
        name: formattedFullName,
        full_name: formattedFullName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        phone: formData.mobile,
        email: formData.email,
        otp: customOtp || otp || undefined,
        profilePic: finalPicUrl,
        profile_pic: finalPicUrl,
      };

      const res = await userApi.updateProfile(updatePayload);

      if (res && (res.success || res.status === 'success' || res.data)) {
        // Extract updated user or construct new user state
        const serverUser = res.data?.user || res.data || {};

        const updatedUserObject = {
          ...user,
          ...serverUser,
          name: formattedFullName,
          mobile: formData.mobile,
          email: serverUser.email || formData.email,
          profile_pic: serverUser.profile_pic || serverUser.profilePic || finalPicUrl,
          profilePic: serverUser.profile_pic || serverUser.profilePic || finalPicUrl,
        };

        // Update AuthContext globally so ProfileHero updates immediately
        if (typeof updateUser === 'function') {
          updateUser(updatedUserObject);
        }

        setProfilePic(updatedUserObject.profile_pic);
        setProfileFile(null);
        setShowOtpModal(false);
        setOtp('');
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
      } else {
        setMessage({ text: res?.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({
        text: error.response?.data?.message || error.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'User Name';
  const displayPicUrl = resolveImageUrl(profilePic);
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <section className="pt-20 sm:pt-24 pb-10 sm:pb-16 bg-[#FAFAF8] min-h-screen">
      <ProfileHero />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mt-8">
        <div className="flex flex-col gap-6">
          {/* Profile Info Card */}
          <div className="bg-[#F9F7F2] border border-black/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-black tracking-wide">Profile Info</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 text-xs font-bold text-[#C8A64D] border-b border-[#C8A64D] pb-0.5 hover:text-black hover:border-black transition-colors"
                >
                  Edit <Pencil size={12} />
                </button>
              )}
            </div>

            {message.text && (
              <div
                className={`mb-4 text-xs font-semibold p-2.5 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isEditing ? (
                <div className="space-y-4">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1">
                      Profile Picture
                    </label>
                    <label
                      htmlFor="profilePicInput"
                      className="w-full h-[2.75rem] rounded-lg border border-black/15 flex items-center px-3 cursor-pointer bg-white overflow-hidden hover:border-black/30 transition"
                    >
                      {profilePic ? (
                        <img
                          src={displayPicUrl}
                          alt="Preview"
                          className="h-7 w-7 rounded-full object-cover mr-2 shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                      <span className="text-black/60 text-xs">
                        {profileFile ? profileFile.name : 'Choose new photo...'}
                      </span>
                    </label>
                    <input
                      id="profilePicInput"
                      type="file"
                      accept="image/*"
                      onChange={handlePicChange}
                      className="hidden"
                    />
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[0.6875rem] font-medium text-black/60 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full text-xs font-medium text-black bg-white border border-black/15 rounded-md px-2.5 py-2 outline-none focus:border-[#C8A64D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6875rem] font-medium text-black/60 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full text-xs font-medium text-black bg-white border border-black/15 rounded-md px-2.5 py-2 outline-none focus:border-[#C8A64D]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[0.6875rem] font-medium text-black/60 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="w-full text-xs font-medium text-black bg-white border border-black/15 rounded-md px-2.5 py-2 outline-none focus:border-[#C8A64D]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[0.6875rem] font-medium text-black/60 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full text-xs font-medium text-black bg-white border border-black/15 rounded-md px-2.5 py-2 outline-none focus:border-[#C8A64D]"
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 bg-[#C8A64D] hover:bg-black text-black hover:text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Check size={14} />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-black/5 hover:bg-black/10 text-black rounded-lg text-xs font-medium transition flex items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display View */
                <div>
                  <div className="flex items-center gap-3 pb-4 mb-1">
                    <div className="w-14 h-14 rounded-full bg-[#C8A64D] flex items-center justify-center text-black font-bold text-xl shrink-0 overflow-hidden">
                      {displayPicUrl ? (
                        <img
                          src={displayPicUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <p className="text-sm font-semibold text-black">{fullName}</p>
                  </div>

                  <div className="divide-y divide-black/5">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <span className="text-[0.8125rem] text-black/50">Full Name</span>
                      <span className="text-[0.8125rem] font-semibold text-black text-right">{fullName}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <span className="text-[0.8125rem] text-black/50">Phone</span>
                      <span className="text-[0.8125rem] font-semibold text-black text-right">{formData.mobile || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <span className="text-[0.8125rem] text-black/50">Email</span>
                      <span className="text-[0.8125rem] font-semibold text-black text-right">{formData.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <ProfileAddress />
        </div>

        <ProfileOrders compact />

        {/* OTP Verification Modal for Email Change */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-2xl text-center relative animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-[#F5F0E1] text-[#C8A64D] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Check size={24} className="stroke-[3]" />
              </div>
              <h3 className="font-serif text-2xl text-slate-900 tracking-wide mb-2">( VERIFY NEW EMAIL )</h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                To update your account email to <span className="font-bold text-slate-800">{formData.email}</span>, please enter the 6-digit verification code sent to that address.
              </p>
              <div className="mb-6">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-center font-mono text-3xl tracking-[0.4em] font-black text-slate-900 focus:ring-2 focus:ring-[#C8A64D] focus:border-[#C8A64D] outline-none transition shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={isUpdating || otp.length < 6}
                  onClick={() => handleSubmit(null, otp)}
                  className="w-full bg-[#C8A64D] text-white font-bold py-3.5 rounded-full hover:bg-[#b8974a] transition disabled:opacity-50 text-sm uppercase tracking-widest shadow-md"
                >
                  {isUpdating ? 'Verifying...' : 'VERIFY & SAVE CHANGES'}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      await userApi.sendEmailChangeOtp({ email: formData.email });
                      setMessage({ text: `Resent verification code to ${formData.email}.`, type: 'success' });
                    } catch (error) {
                      setMessage({ text: error.response?.data?.message || 'Failed to resend code.', type: 'error' });
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  className="text-xs text-[#C8A64D] font-bold hover:underline py-1 uppercase tracking-wider"
                >
                  Resend Verification Code
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp('');
                  }}
                  className="text-xs text-stone-400 hover:text-stone-600 underline mt-1"
                >
                  Cancel &amp; Edit Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileForm;