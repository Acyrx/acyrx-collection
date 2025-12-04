"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmEmailWithCode } from "@/app/auth/actions";

export default function ConfirmPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const supabase = createClient();

        // Get token from URL hash (email confirmation) or search params (OAuth)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        const code = searchParams.get("code");
        const token = searchParams.get("token");
        const tokenHash = searchParams.get("token_hash");

        // Handle email confirmation with code (PKCE flow)
        // Supabase may use code-based confirmation in some configurations
        if (code && type === "email") {
          // Use server action to exchange code server-side (handles PKCE properly)
          const result = await confirmEmailWithCode(code);

          if (!result.success) {
            throw new Error(result.error?.message || "Failed to confirm email");
          }

          if (result.data?.session) {
            setSuccess(true);
            setTimeout(() => {
              router.push("/");
            }, 1500);
            return;
          }
        } else if (code) {
          // Code without type=email is likely OAuth - redirect to callback route
          router.push(`/auth/callback?code=${code}`);
          return;
        }

        // Handle email confirmation with token from URL hash
        if (accessToken && type === "email") {
          // Set the session using the tokens from the hash
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });

          if (sessionError) {
            throw sessionError;
          }

          if (sessionData.session) {
            setSuccess(true);
            setTimeout(() => {
              router.push("/");
            }, 1500);
            return;
          }
        }

        // Handle email confirmation with token from query params (alternative format)
        if (token && tokenHash) {
          const { data: verifyData, error: verifyError } =
            await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "email",
            });

          if (verifyError) {
            throw verifyError;
          }

          if (verifyData.session) {
            setSuccess(true);
            setTimeout(() => {
              router.push("/");
            }, 1500);
            return;
          }
        }

        // Fallback: Check if we already have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          setSuccess(true);
          setTimeout(() => {
            router.push("/");
          }, 1500);
          return;
        }

        // No valid token or session
        setError(
          "Invalid confirmation link or session expired. Please try signing up again."
        );
      } catch (err: unknown) {
        console.error("Acyrx Confirmation error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Confirmation failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-sm">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              )}
              {success && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {error && <XCircle className="w-5 h-5 text-destructive" />}
              <CardTitle className="text-2xl">
                {isLoading
                  ? "Confirming..."
                  : error
                  ? "Confirmation Failed"
                  : "Successfully Confirmed"}
              </CardTitle>
            </div>
            <CardDescription>
              {isLoading
                ? "Please wait while we verify your account"
                : error
                ? "There was an issue confirming your account"
                : "Your account has been successfully confirmed!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="space-y-2">
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </p>
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {success && !error && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Redirecting you to the app...
                </p>
                <Button onClick={() => router.push("/")} className="w-full">
                  Go to App
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
