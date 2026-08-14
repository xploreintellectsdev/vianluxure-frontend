"use client";
import { useAuthContext } from "@/components/Users/context/AuthContext";

// Thin wrapper so every existing `import { useAuth } from "@/hooks/Useauth"`
// keeps working unchanged now that there's a real AuthProvider behind it —
// this used to always return a hardcoded `{ user: null }`.
export const useAuth = () => {
  const { user } = useAuthContext();
  return { user };
};
