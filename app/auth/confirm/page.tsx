"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ConfirmPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const supabase = createClient();

        // The middleware already processed the hash and set the session cookie
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          setError(
            "Invalid confirmation link or session expired. Please try signing up again."
          );
          setIsLoading(false);
          return;
        }

        // Success - wait a moment then redirect
        setTimeout(() => {
          router.push("/");
        }, 1500);
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
  }, [router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-sm">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLoading
                ? "Confirming Email..."
                : error
                ? "Confirmation Failed"
                : "Email Confirmed"}
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Please wait while we verify your email"
                : error
                ? "There was an issue confirming your email"
                : "Your email has been successfully confirmed!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {isLoading && (
              <div className="text-sm text-muted-foreground">Processing...</div>
            )}
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground">
                Redirecting to chat...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
