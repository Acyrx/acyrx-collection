"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Phone, Github, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { ErrorModal } from "@/components/error-modal"
import { PhoneLoginModal } from "@/components/phone-login-modal"
import { signup, signinWithGithub } from "@/app/auth/actions"

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

  if (username.length === 0) {
    errors.push("Username is required")
  } else if (username.length > 50) {
    errors.push("Username must be 50 characters or less")
  } else if (username.length < 3) {
    errors.push("Username must be at least 3 characters")
  }

  const forbiddenChars = [
    " ",
    '"',
    "'",
    "+",
    "=",
    ";",
    "--",
    "/*",
    "*/",
    "<",
    ">",
    "&",
    "|",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "\\",
    "/",
    "%",
    "_",
  ]
  const foundForbiddenChars = forbiddenChars.filter((char) => username.includes(char))

  if (foundForbiddenChars.length > 0) {
    errors.push(`Username cannot contain: ${foundForbiddenChars.join(", ")}`)
  }

  const validPattern = /^[a-zA-Z0-9\-_]*$/
  if (username && !validPattern.test(username)) {
    errors.push("Username can only contain letters, numbers, hyphens, and underscores")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

const validatePassword = (
  password: string,
): { isValid: boolean; errors: string[]; strength: "weak" | "medium" | "strong" } => {
  const errors: string[] = []

  if (password.length === 0) {
    errors.push("Password is required")
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  } else if (password.length > 60) {
    errors.push("Password must be 60 characters or less")
  }

  let strength: "weak" | "medium" | "strong" = "weak"
  let strengthScore = 0

  if (password.length >= 8) strengthScore++
  if (/[a-z]/.test(password)) strengthScore++
  if (/[A-Z]/.test(password)) strengthScore++
  if (/[0-9]/.test(password)) strengthScore++
  if (/[^a-zA-Z0-9]/.test(password)) strengthScore++

  if (strengthScore >= 4) strength = "strong"
  else if (strengthScore >= 3) strength = "medium"

  return {
    isValid: errors.length === 0 && password.length >= 8 && password.length <= 60,
    errors,
    strength,
  }
}

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [detectedType, setDetectedType] = useState<"email" | "phone">("email")
  const [usernameValidation, setUsernameValidation] = useState({ isValid: true, errors: [] as string[] })
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    errors: [] as string[],
    strength: "weak" as "weak" | "medium" | "strong",
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

  useEffect(() => {
    if (!emailOrPhone.trim()) {
      setDetectedType("email")
      return
    }

    if (isEmail(emailOrPhone)) {
      setDetectedType("email")
    } else if (isPhoneNumber(emailOrPhone)) {
      setDetectedType("phone")
    } else {
      setDetectedType("email")
    }
  }, [emailOrPhone])

  useEffect(() => {
    if (username) {
      setUsernameValidation(validateUsername(username))
    } else {
      setUsernameValidation({ isValid: true, errors: [] })
    }
  }, [username])

  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password))
    } else {
      setPasswordValidation({ isValid: true, errors: [], strength: "weak" })
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError({ isOpen: false, message: "" })

    try {
      const usernameCheck = validateUsername(username)
      const passwordCheck = validatePassword(password)

      if (!usernameCheck.isValid) {
        throw new Error(`Username validation failed: ${usernameCheck.errors.join(", ")}`)
      }

      if (!passwordCheck.isValid) {
        throw new Error(`Password validation failed: ${passwordCheck.errors.join(", ")}`)
      }

      const formData = new FormData()
      formData.append("username", username)
      formData.append(detectedType === "email" ? "email" : "phone", emailOrPhone)
      formData.append("password", password)

      const result = await signup(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: "Registration Failed",
          message: result.error?.message || "An unexpected error occurred",
          details: "Error Code: REG_001",
        })
        return
      }

      console.log("Signup successful:", result.message)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"

      const title = "Registration Failed"
      let message = ""
      let details = ""

      if (errorMessage.includes("Username validation failed")) {
        message = errorMessage.replace("Username validation failed: ", "")
        details = "Error Code: REG_001"
      } else if (errorMessage.includes("Password validation failed")) {
        message = errorMessage.replace("Password validation failed: ", "")
        details = "Error Code: REG_003"
      } else {
        message = errorMessage
        details = "Error Code: REG_999"
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

  const getEmailPhoneLabel = () => {
    return detectedType === "email" ? "Email address" : "Phone number"
  }

  const getEmailPhonePlaceholder = () => {
    return detectedType === "email" ? "Enter your email address" : "Enter your phone number"
  }

  const getPasswordStrengthColor = () => {
    switch (passwordValidation.strength) {
      case "strong":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      default:
        return "text-red-500"
    }
  }

  const handleSocialSignup = async (provider: string) => {
    try {
      if (provider === "github") {
        await signinWithGithub()
      }
    } catch (err) {
      setError({
        isOpen: true,
        title: "Social Registration Failed",
        message: `We couldn't create your account with ${provider}.`,
        details: `Error Code: SOCIAL_002 - ${provider.toUpperCase()}_REG_FAILED`,
      })
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
          <CardDescription className="text-muted-foreground">Create your account to get started</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialSignup("github")}
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
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                Username
                {username &&
                  (usernameValidation.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ))}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username (3-50 chars, no spaces or special chars)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 ${
                  username && !usernameValidation.isValid ? "border-red-500/50" : ""
                }`}
                required
              />
              {username && !usernameValidation.isValid && (
                <div className="text-xs text-red-500 space-y-1">
                  {usernameValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                3-50 characters, letters, numbers, hyphens and underscores only
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailOrPhone" className="text-sm font-medium flex items-center gap-2">
                {getEmailPhoneLabel()}
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {detectedType}
                </span>
              </Label>
              <Input
                id="emailOrPhone"
                type={detectedType === "email" ? "email" : "tel"}
                placeholder={getEmailPhonePlaceholder()}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                Password
                {password && (
                  <>
                    {passwordValidation.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                      {passwordValidation.strength}
                    </span>
                  </>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password (8-60 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10 ${
                    password && !passwordValidation.isValid ? "border-red-500/50" : ""
                  }`}
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
              {password && !passwordValidation.isValid && (
                <div className="text-xs text-red-500 space-y-1">
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                8-60 characters with uppercase, lowercase, numbers, and special characters for best security
              </div>
            </div>

            <div className="flex items-start space-x-2 text-sm">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-0.5 rounded border-border/50 bg-input/50 text-primary focus:ring-primary/20"
                required
              />
              <label htmlFor="terms" className="text-muted-foreground cursor-pointer">
                I agree to the{" "}
                <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading || !usernameValidation.isValid || !passwordValidation.isValid}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>

      <PhoneLoginModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={(phone) => console.log("Phone signup successful:", phone)}
        isSignup={true}
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
