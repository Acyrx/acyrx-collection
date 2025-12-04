"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type {
  User,
  Session,
  AuthError,
  AuthChangeEvent,
} from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  // Auth methods
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: AuthError | null }>;
  verifyPhoneOtp: (
    phone: string,
    token: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  // User info helpers
  getAuthProvider: () => "email" | "phone" | "github" | "unknown";
  getUserDisplayName: () => string;
  getUserAvatar: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();
  const supabase = createClient();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user,
        });
      } catch (error) {
        console.error("Failed to get session:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user,
        });

        // Handle specific auth events
        if (event === "SIGNED_OUT") {
          router.push("/auth/login");
        } else if (event === "SIGNED_IN") {
          router.refresh();
        } else if (event === "TOKEN_REFRESHED") {
          // Session was refreshed
        } else if (event === "PASSWORD_RECOVERY") {
          router.push("/auth/reset-password");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Sign in with email and password
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase]
  );

  // Sign up with email and password
  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            window.location.origin,
        },
      });
      return { error };
    },
    [supabase]
  );

  // Sign in with phone (sends OTP)
  const signInWithPhone = useCallback(
    async (phone: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      return { error };
    },
    [supabase]
  );

  // Verify phone OTP
  const verifyPhoneOtp = useCallback(
    async (phone: string, token: string) => {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      return { error };
    },
    [supabase]
  );

  // Sign in with GitHub
  const signInWithGitHub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          window.location.origin
        }/auth/callback`,
      },
    });
    return { error };
  }, [supabase]);

  // Sign out current session
  const signOut = useCallback(async () => {
    // Clear session token cookie
    document.cookie =
      "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [supabase, router]);

  // Sign out from all devices
  const signOutAllDevices = useCallback(async () => {
    try {
      // Revoke all other sessions first
      await fetch("/api/sessions/revoke-all", { method: "POST" });
      // Then sign out current session
      await signOut();
    } catch (error) {
      console.error("Failed to sign out all devices:", error);
      // Still sign out current session
      await signOut();
    }
  }, [signOut]);

  // Reset password (sends email)
  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          window.location.origin
        }/auth/reset-password`,
      });
      return { error };
    },
    [supabase]
  );

  // Update password
  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    },
    [supabase]
  );

  // Refresh session
  const refreshSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.refreshSession();
    setState((prev) => ({
      ...prev,
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session?.user,
    }));
  }, [supabase]);

  // Get auth provider
  const getAuthProvider = useCallback(():
    | "email"
    | "phone"
    | "github"
    | "unknown" => {
    if (!state.user) return "unknown";
    if (state.user.app_metadata?.provider === "github") return "github";
    if (state.user.phone) return "phone";
    if (state.user.email) return "email";
    return "unknown";
  }, [state.user]);

  // Get user display name
  const getUserDisplayName = useCallback((): string => {
    if (!state.user) return "Guest";
    return (
      state.user.user_metadata?.full_name ||
      state.user.user_metadata?.name ||
      state.user.user_metadata?.user_name ||
      state.user.email?.split("@")[0] ||
      state.user.phone ||
      "User"
    );
  }, [state.user]);

  // Get user avatar
  const getUserAvatar = useCallback((): string | null => {
    if (!state.user) return null;
    return state.user.user_metadata?.avatar_url || null;
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    verifyPhoneOtp,
    signInWithGitHub,
    signOut,
    signOutAllDevices,
    resetPassword,
    updatePassword,
    refreshSession,
    getAuthProvider,
    getUserDisplayName,
    getUserAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
