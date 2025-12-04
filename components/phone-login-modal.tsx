"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Phone, ArrowLeft, Loader2 } from "lucide-react"
import { ErrorModal } from "@/components/error-modal"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { sendPhoneOTP, verifyPhoneOTP } from "@/app/auth/actions"
import { isValidPhoneNumber } from "react-phone-number-input"
import { getUserCountry } from "@/lib/utils/country-detection"
import { getCarrierInfo } from "@/lib/utils/carrier-detection"
import type { CountryCode } from "@/lib/utils/country-detection"

interface PhoneLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (phone: string) => void
  isSignup?: boolean
}

type Step = "phone" | "otp"

export function PhoneLoginModal({ isOpen, onClose, onSuccess, isSignup = false }: PhoneLoginModalProps) {
  const [phone, setPhone] = useState<string>("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<Step>("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [detectedCountry, setDetectedCountry] = useState<CountryCode | undefined>(undefined)
  const [carrierInfo, setCarrierInfo] = useState<string | null>(null)
  const [isDetectingCountry, setIsDetectingCountry] = useState(true)
  const [error, setError] = useState<{
    isOpen: boolean
    title?: string
    message: string
    details?: string
  }>({
    isOpen: false,
    message: "",
  })

  // Auto-detect country on mount
  useEffect(() => {
    if (isOpen && step === "phone") {
      setIsDetectingCountry(true)
      getUserCountry()
        .then((country) => {
          if (country) {
            setDetectedCountry(country as CountryCode)
          }
        })
        .catch((error) => {
          console.error("Error detecting country:", error)
        })
        .finally(() => {
          setIsDetectingCountry(false)
        })
    }
  }, [isOpen, step])

  // Update carrier info when phone number changes
  useEffect(() => {
    if (phone && isValidPhoneNumber(phone)) {
      const info = getCarrierInfo(phone)
      if (info) {
        // Show country name or carrier info
        if (info.carrier) {
          setCarrierInfo(`Carrier: ${info.carrier}`)
        } else if (info.countryName) {
          setCarrierInfo(info.countryName)
        } else {
          setCarrierInfo(null)
        }
      } else {
        setCarrierInfo(null)
      }
    } else {
      setCarrierInfo(null)
    }
  }, [phone])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !isValidPhoneNumber(phone)) {
      setError({
        isOpen: true,
        title: "Invalid Phone Number",
        message: "Please enter a valid phone number with country code.",
        details: "Error Code: PHONE_001",
      })
      return
    }

    setIsLoading(true)
    setError({ isOpen: false, message: "" })

    try {
      const formData = new FormData()
      formData.append("phone", phone)

      const result = await sendPhoneOTP(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: "Failed to Send OTP",
          message: result.error?.message || "An unexpected error occurred.",
          details: "Error Code: AUTH_004",
        })
        return
      }

      setStep("otp")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError({
        isOpen: true,
        title: "Failed to Send OTP",
        message: errorMessage,
        details: "Error Code: PHONE_999",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      setError({
        isOpen: true,
        title: "Invalid OTP",
        message: "Please enter the 6-digit OTP code.",
        details: "Error Code: PHONE_002",
      })
      return
    }

    setIsLoading(true)
    setError({ isOpen: false, message: "" })

    try {
      const formData = new FormData()
      formData.append("phone", phone)
      formData.append("token", otp)

      const result = await verifyPhoneOTP(formData)

      if (!result.success) {
        setError({
          isOpen: true,
          title: isSignup ? "Verification Failed" : "Login Failed",
          message: result.error?.message || "Invalid OTP. Please try again.",
          details: "Error Code: AUTH_005",
        })
        return
      }

      onSuccess(phone)
      setPhone("")
      setOtp("")
      setStep("phone")
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError({
        isOpen: true,
        title: isSignup ? "Verification Failed" : "Login Failed",
        message: errorMessage,
        details: "Error Code: PHONE_999",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep("phone")
    setOtp("")
    setError({ isOpen: false, message: "" })
  }

  const handleClose = () => {
    setPhone("")
    setOtp("")
    setStep("phone")
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
              <DialogTitle>
                {step === "otp"
                  ? "Verify OTP"
                  : isSignup
                    ? "Sign Up with Phone"
                    : "Sign In with Phone"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              {step === "otp"
                ? "Enter the 6-digit code sent to your phone"
                : isSignup
                  ? "Create an account using your phone number"
                  : "Sign in to your account using your phone number"}
            </DialogDescription>
          </DialogHeader>

          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <PhoneInput
                    international
                    defaultCountry={detectedCountry || "US"}
                    value={phone}
                    onChange={(value) => setPhone(value || "")}
                    className="phone-input"
                    withCountryCallingCode={true}
                    numberInputProps={{
                      className:
                        "h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-md px-3 w-full",
                    }}
                  />
                  {isDetectingCountry && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    We'll send you a verification code via SMS
                  </p>
                  {carrierInfo && (
                    <p className="text-xs text-muted-foreground">
                      Carrier: <span className="font-medium">{carrierInfo}</span>
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                disabled={isLoading || !phone}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setOtp(value)
                  }}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 text-center text-2xl tracking-widest"
                  required
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Code sent to {phone}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-11"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </div>
                  ) : isSignup ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
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
