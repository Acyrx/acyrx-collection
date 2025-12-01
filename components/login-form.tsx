"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Phone, Github, Eye, EyeOff, Sparkles, Check, X } from "lucide-react"
import { ErrorModal } from "@/components/error-modal"
import { PhoneLoginModal } from "@/components/phone-login-modal"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"
import { signin, signinWithGithub } from "@/app/auth/actions"

const isPhoneNumber = (value: string): boolean => {
  const digitsOnly = value.replace(/\D/g, "")
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    const phonePatterns = [
      /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
      /^\+?[1-9]\d{1,14}$/,
      /^[0-9]{10}$/,
      /^$$[0-9]{3}$$\s?[0-9]{3}-?[0-9]{4}$/,
      /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/,
    ]
    return phonePatterns.some((pattern) => pattern.test(value))
  }
  return false
}

const isEmail = (value: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value)
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

  const validPattern = /^[a-zA-Z0-9_-]+$/
  if (username && !validPattern.test(username)) {
    errors.push("Username can only contain letters, numbers, hyphens, and underscores")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [credential, setCredential] = useState("")
  const [password, setPassword] = useState("")
  const [detectedType, setDetectedType] = useState<"email" | "phone" | "username">("email")
  const [usernameValidation, setUsernameValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: [],
  })
  const [error, setError] = useState<{
    isOpen: boolean
    title?: string
    message: string
    details?: string
  }>({
    isOpen: false,
    message: "",
  })
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (detectedType === "username" && !usernameValidation.isValid) {
      setError({
        isOpen: true,
        title: "Invalid Username",
        message: "Please fix the username errors before continuing.",
        details: usernameValidation.errors.join(", "),
      })
      return
    }

    setIsLoading(true)
    setError({ isOpen: false, message: "" })

    try {
      const formData = new FormData()
      formData.append(detectedType === "phone" ? "phone" : "email", credential)
      formData.append("password", password)

      const result = await signin(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: "Login Failed",
          message: result.error?.message || "An unexpected error occurred",
          details: "Error Code: AUTH_001",
        })
        return
      }

      console.log("Login successful:", result.message)
      // You can redirect here using router.push() or window.location
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError({
        isOpen: true,
        title: "Login Failed",
        message: errorMessage,
        details: "Error Code: AUTH_ERR",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      if (provider === "github") {
        await signinWithGithub()
      }
    } catch (err) {
      setError({
        isOpen: true,
        title: "Social Login Failed",
        message: `We couldn't sign you in with ${provider}. This might be due to a temporary issue.`,
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
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ai
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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
              onClick={() => setIsPhoneModalOpen(true)}
              className="h-11 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credential" className="text-sm font-medium flex items-center gap-2">
                {getInputLabel()}
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {detectedType}
                </span>
                {detectedType === "username" && credential && (
                  <span className="flex items-center">
                    {usernameValidation.isValid ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-500" />
                    )}
                  </span>
                )}
              </Label>
              <Input
                id="credential"
                type={detectedType === "email" ? "email" : "text"}
                placeholder={getInputPlaceholder()}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className={`h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 ${
                  detectedType === "username" && !usernameValidation.isValid ? "border-red-500/50" : ""
                }`}
                required
              />
              {detectedType === "username" && !usernameValidation.isValid && (
                <div className="space-y-1">
                  {usernameValidation.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
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
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading || (detectedType === "username" && !usernameValidation.isValid)}
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
            <button
              onClick={onSwitchToSignup}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />

      <PhoneLoginModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={(phone) => console.log("Phone login successful:", phone)}
        isSignup={false}
      />

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
