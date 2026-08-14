"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { authApi } from "@/api/auth.api";
import { useAuthContext } from "@/components/Users/context/AuthContext";
import showToast from "@/sharables/toast";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authApi.login(form);
      login(res.data.user, res.data.token);
      showToast.success("Welcome back!");
      router.push("/profile");
    } catch (err) {
      showToast.error(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      try {
        const res = await authApi.googleLogin({ access_token: tokenResponse.access_token });
        login(res.data.user, res.data.token);
        showToast.success("Welcome back!");
        router.push("/profile");
      } catch (err) {
        showToast.error(err.message || "Google sign in failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      showToast.error("Google sign in was unsuccessful. Please check your Google settings or try again.");
    },
  });

  return (
    <div className="bg-[#FAFAF8] min-h-screen py-24 px-4 text-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-serif text-center tracking-widest mb-8">( SIGN IN )</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-[#C8A64D] focus:border-[#C8A64D] text-gray-900 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} name="password" required value={form.password} onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-[#C8A64D] focus:border-[#C8A64D] text-gray-900 px-3 py-2.5 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full bg-[#C8A64D] text-white font-bold py-3 rounded-full hover:bg-[#b8974a] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "SIGN IN"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleGoogleLogin()}
          className="w-full bg-white border-2 border-gray-200 text-gray-800 font-bold py-3 px-4 rounded-full hover:bg-gray-50 hover:border-gray-300 transition shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <FcGoogle className="text-xl shrink-0" />
          <span className="text-[0.84375rem] uppercase tracking-wider font-semibold">Continue with Google</span>
        </button>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#C8A64D] font-bold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
