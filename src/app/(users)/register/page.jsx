import { Suspense } from 'react';
import RegisterForm from "@/components/Users/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="bg-[#FAFAF8] min-h-screen py-24 px-4 flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
