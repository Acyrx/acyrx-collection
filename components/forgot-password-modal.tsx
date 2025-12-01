"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Mail, Phone, Check, X } from "lucide-react"
import { ErrorModal } from "@/components/error-modal"
import { sendResetPasswordEmail, updatePassword } from "@/app/auth/actions"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

type ResetStep = "initial" | "verification" | "reset"

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ResetStep>("initial")
  const [contactMethod, setContactMethod] = useState<"email" | "phone" | null>(null)
  const [contact, setContact] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [error, setError] = useState<{
    isOpen: boolean
    title?: string
    message: string
    details?: string
  }>({
    isOpen: false,
    message: "",
  })

  const isEmail = (value: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
  }

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

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return false
    }
    if (password.length > 60) {
      setPasswordError("Password must be 60 characters or less")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleContactMethodSelect = async (method: "email" | "phone") => {
    setContactMethod(method)
    setContact("")
    setVerificationCode("")
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contact.trim()) {
      setError({
        isOpen: true,
        title: "Missing Information",
        message: `Please enter your ${contactMethod === "email" ? "email address" : "phone number"}`,
      })
      return
    }

    if (contactMethod === "email" && !isEmail(contact)) {
      setError({
        isOpen: true,
        title: "Invalid Email",
        message: "Please enter a valid email address",
      })
      return
    }

    if (contactMethod === "phone" && !isPhoneNumber(contact)) {
      setError({
        isOpen: true,
        title: "Invalid Phone Number",
        message: "Please enter a valid phone number",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", contact)

      const result = await sendResetPasswordEmail(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: "Failed to Send Code",
          message: result.error?.message || "We couldn't send a verification code.",
        })
        return
      }

      setStep("verification")
    } catch (err) {
      setError({
        isOpen: true,
        title: "Failed to Send Code",
        message: `We couldn't send a verification code to your ${contactMethod}. Please try again.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim()) {
      setError({
        isOpen: true,
        title: "Missing Code",
        message: "Please enter the verification code sent to your account",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep("reset")
    } catch (err) {
      setError({
        isOpen: true,
        title: "Invalid Code",
        message: "The verification code you entered is incorrect. Please try again.",
        details: "Error Code: VERIFY_001",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword(newPassword)) {
      return
    }

    if (newPassword !== confirmPassword) {
      setError({
        isOpen: true,
        title: "Password Mismatch",
        message: "The passwords you entered do not match. Please try again.",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("password", newPassword)

      const result = await updatePassword(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: "Reset Failed",
          message: result.error?.message || "We couldn't reset your password.",
        })
        return
      }

      setError({
        isOpen: true,
        title: "Success",
        message: "Your password has been reset successfully. You can now login with your new password.",
      })
      setTimeout(() => {
        handleClose()
      }, 2500)
    } catch (err) {
      setError({
        isOpen: true,
        title: "Reset Failed",
        message: "We couldn't reset your password. Please try again or contact support.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("initial")
    setContactMethod(null)
    setContact("")
    setVerificationCode("")
    setNewPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setPasswordError("")
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            {step !== "initial" && (
              <button
                onClick={() => {
                  if (step === "verification") setStep("initial")
                  else if (step === "reset") setStep("verification")
                }}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4 -ml-2 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <DialogTitle className="text-lg font-semibold">Reset Your Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {step === "initial" && "Choose how you'd like to verify your identity"}
              {step === "verification" && `We sent a code to your ${contactMethod}`}
              {step === "reset" && "Create a new password for your account"}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Select Contact Method */}
          {step === "initial" && !contactMethod && (
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleContactMethodSelect("email")}
                className="w-full h-11 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Reset with Email
              </Button>
              <Button
                variant="outline"
                onClick={() => handleContactMethodSelect("phone")}
                className="w-full h-11 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 justify-start"
              >
                <Phone className="w-4 h-4 mr-2" />
                Reset with Phone
              </Button>
            </div>
          )}

          {/* Step 1: Enter Email/Phone */}
          {step === "initial" && contactMethod && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-medium">
                  {contactMethod === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="contact"
                  type={contactMethod === "email" ? "email" : "tel"}
                  placeholder={contactMethod === "email" ? "your@email.com" : "(123) 456-7890"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === "verification" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Check your {contactMethod} for the verification code</p>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium flex items-center justify-between">
                  New Password
                  {newPassword && (
                    <span className="text-xs flex items-center gap-1">
                      {newPassword.length >= 8 && newPassword.length <= 60 ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          Valid
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-red-500" />
                          Invalid
                        </>
                      )}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      validatePassword(e.target.value)
                    }}
                    className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading || !newPassword || !confirmPassword || passwordError !== ""}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
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
