"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { authApi } from "@/api/auth.api";
import { useAuthContext } from "@/components/Users/context/AuthContext";
import showToast from "@/sharables/toast";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthContext();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otp, setOtp] = useState("");

  const emailParam = searchParams?.get("email") || "";
  const nameParam = searchParams?.get("name") || "";
  const mobileParam = searchParams?.get("mobile") || "";
  const orderNumberParam = searchParams?.get("orderNumber") || "";

  useEffect(() => {
    if (emailParam || nameParam || mobileParam) {
      setForm(prev => ({
        ...prev,
        email: emailParam || prev.email,
        name: nameParam || prev.name,
        mobile: mobileParam || prev.mobile
      }));
    }
  }, [emailParam, nameParam, mobileParam]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      showToast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.sendOtp({
        name: form.name,
        email: form.email,
        mobile: form.mobile
      });
      showToast.success(`Verification code sent to ${form.email}`);
      setStep("otp");
    } catch (err) {
      showToast.error(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      showToast.error("Please enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        otp: otp
      });
      login(res.data.user, res.data.token);
      showToast.success("Account created and email verified!");
      router.push("/profile");
    } catch (err) {
      showToast.error(err.message || "Registration failed. Please verify your OTP code.");
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
        showToast.success("Account connected!");
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

  if (step === "otp") {
    return (
      <div className="bg-[#FAFAF8] min-h-screen py-24 px-4 text-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-[#F5F0E1] text-[#C8A64D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-2xl font-serif tracking-widest mb-2">( VERIFY EMAIL )</h1>
          <p className="text-xs text-stone-500 font-medium mb-6 leading-relaxed">
            We have sent a 6-digit verification code to <span className="font-bold text-slate-800">{form.email}</span>. Please enter it below to verify your email and create your account.
          </p>

          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-center font-mono text-3xl tracking-[0.4em] font-black text-slate-900 focus:ring-2 focus:ring-[#C8A64D] focus:border-[#C8A64D] outline-none transition shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C8A64D] text-white font-bold py-3.5 rounded-full hover:bg-[#b8974a] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wider shadow-md"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "VERIFY & CREATE ACCOUNT"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-stone-500 flex flex-col gap-3">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit({ preventDefault: () => {} });
              }}
              className="text-[#C8A64D] font-bold hover:underline uppercase tracking-wider"
            >
              Resend Verification Code
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep("form")}
              className="text-stone-400 hover:text-stone-600 underline mt-2"
            >
              &larr; Back to edit email or details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF8] min-h-screen py-24 px-4 text-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-serif text-center tracking-widest mb-6">( CREATE ACCOUNT )</h1>

        {orderNumberParam && (
          <div className="mb-6 p-4 bg-[#F5F0E1]/80 border border-[#C8A64D]/40 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={20} className="text-[#C8A64D] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#C8A64D] uppercase tracking-wider mb-0.5">Complete Your Registration</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Set a password to complete your account and manage your order <span className="font-bold text-slate-800">{orderNumberParam}</span>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text" name="name" required value={form.name} onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-[#C8A64D] focus:border-[#C8A64D] text-gray-900 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-[#C8A64D] focus:border-[#C8A64D] text-gray-900 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Mobile Number</label>
            <input
              type="tel" name="mobile" required value={form.mobile} onChange={handleChange}
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

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"} name="confirmPassword" required value={form.confirmPassword} onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-[#C8A64D] focus:border-[#C8A64D] text-gray-900 px-3 py-2.5"
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full bg-[#C8A64D] text-white font-bold py-3 rounded-full hover:bg-[#b8974a] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "CONTINUE TO VERIFY EMAIL"}
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
          Already have an account?{" "}
          <Link href="/login" className="text-[#C8A64D] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
