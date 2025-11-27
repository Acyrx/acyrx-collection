"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Github, Calendar, Shield } from "lucide-react"

export function UserProfile() {
  const { user, getAuthProvider, getUserDisplayName, getUserAvatar } = useAuth()

  if (!user) return null

  const provider = getAuthProvider()
  const providerLabel = provider === "github" ? "GitHub" : provider === "phone" ? "Phone" : "Email"

  const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never"

  const avatarUrl = getUserAvatar()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Profile
        </CardTitle>
        <CardDescription>Account information and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {avatarUrl ? (
              <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="h-12 w-12 rounded-full" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{getUserDisplayName()}</p>
            <Badge variant="secondary" className="text-xs">
              {providerLabel}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {user.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium truncate flex-1">{user.email}</span>
              {user.email_confirmed_at && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  Verified
                </Badge>
              )}
            </div>
          )}

          {user.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{user.phone}</span>
              {user.phone_confirmed_at && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  Verified
                </Badge>
              )}
            </div>
          )}

          {provider === "github" && (
            <div className="flex items-center gap-3 text-sm">
              <Github className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">GitHub:</span>
              <span className="font-medium">{user.user_metadata?.user_name || "Connected"}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Joined:</span>
            <span className="font-medium">{createdAt}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last sign in:</span>
            <span className="font-medium">{lastSignIn}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
