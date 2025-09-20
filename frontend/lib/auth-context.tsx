"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginService, verifyService, logoutService } from "@/services/auth";
import type { User } from "@/lib/types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Cookie-only auth: presence of a valid user implies authentication
  const isAuthenticated = !!user;

  useEffect(() => {
    // Cookie-only: ask backend to verify via cookie; no header
    (async () => {
      try {
        const data = await verifyService("");
        setUser(data.user);
        setToken(null);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const verifyToken = async (accessToken: string) => {
    try {
      const data = await verifyService(accessToken);
      setUser(data.user);
      setToken(accessToken);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        const response = (error as { response?: { status?: number } }).response;
        const status = response?.status;
        if (status !== 401 && status !== 403) {
          console.error("Error verifying token:", error);
        }
      } else {
        console.error("Error verifying token:", error);
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginService(emailOrUsername, password);
      const { user: userData } = data;
      setUser(userData);
      setToken(null);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Login error:", error);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutService("");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      // Cookie-only strategy: nothing to clear in localStorage
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
