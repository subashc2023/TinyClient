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

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (savedToken) {
      setToken(savedToken);
      void verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
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
      const { user: userData, tokens } = data;

      setUser(userData);
      setToken(tokens.access_token);

      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
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
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        await logoutService(accessToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
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
