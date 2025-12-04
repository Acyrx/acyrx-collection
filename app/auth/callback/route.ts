import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side OAuth callback handler
 * Handles PKCE flow when OAuth is initiated server-side
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/";

  // Handle OAuth errors
  if (error) {
    const errorUrl = new URL("/auth/error", requestUrl.origin);
    errorUrl.searchParams.set(
      "error",
      errorDescription || error || "Authentication failed"
    );
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = await createClient();
    
    try {
      // Exchange the code for a session server-side
      // The server-side client handles PKCE by storing code_verifier in cookies
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("OAuth callback error:", exchangeError);
        // If PKCE fails, it might be because the code_verifier wasn't stored properly
        // This can happen if cookies aren't being set correctly
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set(
          "error",
          exchangeError.message || "Failed to exchange authorization code. Please try again."
        );
        return NextResponse.redirect(errorUrl);
      }

      if (data.session) {
        // Success - create a redirect response
        // The session cookies are automatically set by the server-side client's cookie handler
        const response = NextResponse.redirect(new URL(next, requestUrl.origin));
        
        // Ensure cookies are properly set in the response
        // The Supabase SSR client should have already set them via setAll
        return response;
      } else {
        // No session after exchange - redirect to error
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set("error", "Failed to create session after authentication");
        return NextResponse.redirect(errorUrl);
      }
    } catch (err) {
      console.error("Unexpected error during OAuth callback:", err);
      const errorUrl = new URL("/auth/error", requestUrl.origin);
      errorUrl.searchParams.set(
        "error",
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      return NextResponse.redirect(errorUrl);
    }
  }

  // If no code, let the page component handle hash-based tokens
  return NextResponse.next();
}

