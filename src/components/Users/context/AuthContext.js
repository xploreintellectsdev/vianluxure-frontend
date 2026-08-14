"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AUTH_USER_KEY = "vian_auth_user";
const AUTH_TOKEN_KEY = "vian_auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from sessionStorage once on load.
  useEffect(() => {
    const checkSession = () => {
      const loginDate = sessionStorage.getItem("vian_auth_login_date");
      const today = new Date().toISOString().split("T")[0];
      if (loginDate !== today) {
        sessionStorage.removeItem(AUTH_USER_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem("vian_auth_login_date");
        setUser(null);
        return false;
      }
      return true;
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    try {
      const savedUser = sessionStorage.getItem(AUTH_USER_KEY);
      const savedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
      if (savedUser && savedToken && checkSession()) {
        setUser(JSON.parse(savedUser));
      } else if (savedUser || savedToken) {
        checkSession(); // Ensure cleanup if expired
      }
    } catch (err) {
      console.error("Failed to restore session", err);
    } finally {
      setIsLoading(false);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const login = (userData, token) => {
    const { password, plain_password, ...safeUserData } = userData;
    const today = new Date().toISOString().split("T")[0];
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUserData));
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem("vian_auth_login_date", today);
    setUser(safeUserData);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem("vian_auth_login_date");
    setUser(null);
  };

  const updateUser = (userData) => {
    const { password, plain_password, ...safeUserData } = userData;
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUserData));
    setUser(safeUserData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
