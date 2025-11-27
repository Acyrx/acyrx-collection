"use client"

import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SessionTracker() {
  const router = useRouter()
  const supabase = createClient()

  const handleForcedLogout = useCallback(async () => {
    await supabase.auth.signOut()
    // Clear session token cookie
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/auth/login?reason=session_revoked")
  }, [supabase, router])

  const checkSessionValidity = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions/check")
      const data = await response.json()

      if (!data.valid && data.reason === "revoked") {
        await handleForcedLogout()
      }
    } catch (error) {
      console.error("Failed to check session validity:", error)
    }
  }, [handleForcedLogout])

  // Track session on mount
  const trackSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/track-session", {
        method: "POST",
      })
      const data = await response.json()

      if (data.revoked || response.status === 403) {
        await handleForcedLogout()
      }
    } catch (error) {
      console.error("Failed to track session:", error)
    }
  }, [handleForcedLogout])

  useEffect(() => {
    // Initial track
    trackSession()

    const validityInterval = setInterval(checkSessionValidity, 30 * 1000)

    // Update session activity every 5 minutes
    const activityInterval = setInterval(trackSession, 5 * 60 * 1000)

    const handleFocus = () => {
      checkSessionValidity()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      clearInterval(validityInterval)
      clearInterval(activityInterval)
      window.removeEventListener("focus", handleFocus)
    }
  }, [trackSession, checkSessionValidity])

  return null
}
