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

export default function CallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Get code from query params (server-side redirect)
        const code = searchParams.get("code");

        // Get tokens from hash fragment (client-side redirect)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const errorParam = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        // Handle OAuth errors from hash
        if (errorParam) {
          setError(errorDescription || errorParam || "Authentication failed");
          setIsLoading(false);
          return;
        }

        // Handle OAuth callback with code (PKCE flow)
        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (data.session) {
            // Success - redirect to app
            router.push("/");
            return;
          }
        }

        // Handle OAuth callback with tokens in hash (implicit flow)
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) {
            throw sessionError;
          }

          if (sessionData.session) {
            // Success - redirect to app
            router.push("/");
            return;
          }
        }

        // No valid code or tokens
        setError("Invalid callback. No authentication code or tokens found.");
      } catch (err: unknown) {
        console.error("OAuth callback error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
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
              {!isLoading && !error && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {error && <XCircle className="w-5 h-5 text-destructive" />}
              <CardTitle className="text-2xl">
                {isLoading
                  ? "Completing Sign In..."
                  : error
                  ? "Sign In Failed"
                  : "Sign In Successful"}
              </CardTitle>
            </div>
            <CardDescription>
              {isLoading
                ? "Please wait while we complete your sign in"
                : error
                ? "There was an issue signing you in"
                : "You have been successfully signed in!"}
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
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to the app...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
