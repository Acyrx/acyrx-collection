"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Github, Facebook, Eye, EyeOff, Sparkles } from "lucide-react"
import { createClient } from "@/utils/supabase/client";
import { ErrorModal } from "./error-modal"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image";

interface LoginFormProps {
  onSwitchToSignup: () => void
}

const isPhoneNumber = (value: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, "")

  // Check if it's a valid phone number (7-15 digits)
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    // Additional checks for common phone number patterns
    const phonePatterns = [
      /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US format
      /^\+?[1-9]\d{1,14}$/, // International format
      /^[0-9]{10}$/, // Simple 10 digit
      /^$$[0-9]{3}$$\s?[0-9]{3}-?[0-9]{4}$/, // Fixed regex pattern for (123) 456-7890 format
      /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/, // 123-456-7890
    ]

    return phonePatterns.some((pattern) => pattern.test(value))
  }

  return false
}


const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (username.length > 50) {
    errors.push("Username must be 50 characters or less")
  }

  if (username.includes(" ")) {
    errors.push("Username cannot contain spaces")
  }

  const dangerousChars = /['"+<=>{}();/*%-]/
  if (dangerousChars.test(username)) {
    errors.push("Username contains invalid characters")
  }

  // Only allow alphanumeric, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/
  if (username && !validPattern.test(username)) {
    errors.push("Username can only contain letters, numbers, hyphens, and underscores")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

const isEmail = (value: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value)
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [credential, setCredential] = useState("")
  const [detectedType, setDetectedType] = useState<"email" | "phone" | "username">("email")
  const supabase = createClient();
  const [usernameValidation, setUsernameValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: [],
  })
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<{
    isOpen: boolean
    title?: string
    message: string
    details?: string
  }>({
    isOpen: false,
    message: "",
  })

  useEffect(() => {
    if (!credential.trim()) {
      setDetectedType("email")
      setUsernameValidation({ isValid: true, errors: [] })
      return
    }

    if (isEmail(credential)) {
      setDetectedType("email")
      setUsernameValidation({ isValid: true, errors: [] })
    } else if (isPhoneNumber(credential)) {
      setDetectedType("phone")
      setUsernameValidation({ isValid: true, errors: [] })
    } else {
      setDetectedType("username")
      setUsernameValidation(validateUsername(credential))
    }
  }, [credential])

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError({ isOpen: false, message: "" }) // Clear previous errors

    try {
      if (detectedType === "email") {
        const { error } = await supabase.auth.signInWithPassword({
          email: credential,
          password,
        })
        if (error) throw error
      } else {
        // You would need a custom auth flow for phone or username
        throw new Error("Only email login is supported right now.")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"

      let title = "Login Failed"
      let message = ""
      let details = ""

      switch (errorMessage) {
        case "Invalid credentials":
          message =
            "The email/username and password combination you entered is incorrect. Please check your credentials and try again."
          details = "Error Code: AUTH_001"
          break
        case "Account locked":
          title = "Account Temporarily Locked"
          message =
            "Your account has been temporarily locked due to multiple failed login attempts. Please try again in 15 minutes or reset your password."
          details = "Error Code: AUTH_002"
          break
        case "Network error":
          title = "Connection Error"
          message =
            "We're having trouble connecting to our servers. Please check your internet connection and try again."
          details = "Error Code: NET_001"
          break
        default:
          message = "Something went wrong during login. Please try again or contact support if the problem persists."
          details = `Error Code: GEN_001 - ${errorMessage}`
      }
      setError({
        isOpen: true,
        title,
        message,
        details,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      console.log(`Login with ${provider}`)
      // Simulate social login error
      if (Math.random() < 0.4) {
        throw new Error(`${provider} authentication failed`)
      }
    } catch (err) {
      setError({
        isOpen: true,
        title: "Social Login Failed",
        message: `We couldn't sign you in with ${provider}. This might be due to a temporary issue or your ${provider} account may not be linked to an existing account.`,
        details: `Error Code: SOCIAL_001 - ${provider.toUpperCase()}_AUTH_FAILED`,
      })
    }
  }

  const getInputLabel = () => {
    switch (detectedType) {
      case "email":
        return "Email address"
      case "phone":
        return "Phone number"
      case "username":
        return "Username"
      default:
        return "Email, phone, or username"
    }
  }

  const getInputPlaceholder = () => {
    switch (detectedType) {
      case "email":
        return "Enter your email"
      case "phone":
        return "Enter your phone number"
      case "username":
        return "Enter your username"
      default:
        return "Enter email, phone, or username"
    }
  }

  return (
    <>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
          <Image
            src="/images/ai.png"
            alt="AI Logo"
            width={60}
            height={60}
            className="object-contain rounded-xl"
          />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-foreground/70 bg-clip-text text-transparent">
          AI
        </CardTitle>
      </div>
          <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("github")}
              className="h-11 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="h-11 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credential" className="text-sm font-medium flex items-center gap-2">
                {getInputLabel()}
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{detectedType}</span>
              </Label>
              <Input
                id="credential"
                type="text"
                inputMode={
                  detectedType === "email"
                    ? "email"
                    : detectedType === "phone"
                      ? "tel"
                      : "text"
                }
                pattern={
                  detectedType === "email"
                    ? "[^\\s@]+@[^\\s@]+\\.[^\\s@]+"
                    : detectedType === "phone"
                      ? "[0-9+\\-()\\s]*"
                      : "[a-zA-Z0-9_-]+"
                }
                autoComplete={
                  detectedType === "email"
                    ? "email"
                    : detectedType === "phone"
                      ? "tel"
                      : "username"
                }
                placeholder={getInputPlaceholder()}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                required
              />

            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border/50 bg-input/50 text-primary focus:ring-primary/20"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <button className="text-primary hover:text-primary/80 transition-colors font-medium"
              onClick={onSwitchToSignup}
            >Sign up</button>
          </div>
        </CardContent>
      </Card>
      <ErrorModal
        isOpen={error.isOpen}
        onClose={() => setError({ isOpen: false, message: "" })}
        title={error.title}
        message={error.message}
        details={error.details}
      />
    </>
  )
}
