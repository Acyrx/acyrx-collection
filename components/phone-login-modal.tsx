"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, EyeOff, Phone } from "lucide-react"
import { ErrorModal } from "@/components/error-modal"
import { signin } from "@/app/auth/actions"

interface PhoneLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (phone: string) => void
  isSignup?: boolean
}

export function PhoneLoginModal({ isOpen, onClose, onSuccess, isSignup = false }: PhoneLoginModalProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{
    isOpen: boolean
    title?: string
    message: string
    details?: string
  }>({
    isOpen: false,
    message: "",
  })

  const isPhoneValid = (value: string): boolean => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPhoneValid(phone)) {
      setError({
        isOpen: true,
        title: "Invalid Phone Number",
        message: "Please enter a valid phone number.",
        details: "Error Code: PHONE_001",
      })
      return
    }

    if (!password || password.length < 8) {
      setError({
        isOpen: true,
        title: "Invalid Password",
        message: "Password must be at least 8 characters.",
        details: "Error Code: PHONE_002",
      })
      return
    }

    setIsLoading(true)
    setError({ isOpen: false, message: "" })

    try {
      const formData = new FormData()
      formData.append("phone", phone)
      formData.append("password", password)

      const result = await signin(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: isSignup ? "Registration Failed" : "Login Failed",
          message: result.error?.message || "An unexpected error occurred.",
          details: "Error Code: AUTH_004",
        })
        return
      }

      onSuccess(phone)
      setPhone("")
      setPassword("")
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError({
        isOpen: true,
        title: isSignup ? "Registration Failed" : "Login Failed",
        message: errorMessage,
        details: "Error Code: PHONE_999",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPhone("")
    setPassword("")
    setError({ isOpen: false, message: "" })
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <DialogTitle>{isSignup ? "Sign Up with Phone" : "Sign In with Phone"}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              {isSignup
                ? "Create an account using your phone number"
                : "Sign in to your account using your phone number"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                required
              />
              <p className="text-xs text-muted-foreground">Format: (123) 456-7890 or +1234567890</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="phone-password"
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

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </div>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
