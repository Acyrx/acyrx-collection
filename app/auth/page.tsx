"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  useEffect(() => {
    const updateAuthMode = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const mode = urlParams.get("auth")
      if (mode === "signup") {
        setAuthMode("signup")
        document.title = `${authMode}`;
      } else {
        setAuthMode("login")
        document.title = `${authMode}`;
      }
    }

    updateAuthMode()

    // Listen for browser back/forward navigation
    window.addEventListener("popstate", updateAuthMode)

    return () => {
      window.removeEventListener("popstate", updateAuthMode)
    }
  }, [])

  const switchToSignup = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("auth", "signup")
    window.history.pushState({}, "", url.toString())
    setAuthMode("signup")
  }

  const switchToLogin = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("auth")
    window.history.pushState({}, "", url.toString())
    setAuthMode("login")
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {authMode === "login" ? (
          <LoginForm onSwitchToSignup={switchToSignup} />
        ) : (
          <SignupForm onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  )
}
