"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Monitor, Smartphone, Globe, Trash2, RefreshCw, Shield, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  browser: string
  os: string
  device_type: "desktop" | "mobile" | "tablet" | "unknown"
  location: string | null
  created_at: string
  last_active_at: string
  is_current: boolean
}

export function SessionsList() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revokingSession, setRevokingSession] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSessions = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sessions")
      if (!response.ok) {
        throw new Error("Failed to fetch sessions")
      }
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to revoke session")
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast({
        title: "Session revoked",
        description: "The device will be automatically signed out within 30 seconds.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session")
    } finally {
      setRevokingSession(null)
    }
  }

  const handleRevokeAllOtherSessions = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/sessions/revoke-all", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to revoke sessions")
      }

      await fetchSessions()
      toast({
        title: "All other sessions revoked",
        description: "Other devices will be automatically signed out within 30 seconds.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      case "desktop":
        return <Monitor className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const otherSessionsCount = sessions.filter((s) => !s.is_current).length

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>Manage your active sessions across devices</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchSessions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {otherSessionsCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Revoke All Others
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out from all other devices. Only your current session will remain active. Other
                      devices will be automatically signed out within 30 seconds.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevokeAllOtherSessions}>Revoke All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  session.is_current ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    session.is_current ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getDeviceIcon(session.device_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{session.browser}</span>
                    <span className="text-muted-foreground">on</span>
                    <span className="font-medium">{session.os}</span>
                    {session.is_current && <Badge className="text-xs">Current Session</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {session.ip_address && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {session.ip_address}
                      </span>
                    )}
                    {session.location && <span>{session.location}</span>}
                    <span>Last active: {formatDate(session.last_active_at)}</span>
                  </div>
                </div>
                {!session.is_current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={revokingSession === session.id}
                      >
                        {revokingSession === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Revoke
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign out the device using {session.browser} on {session.os}. The device will be
                          automatically signed out within 30 seconds.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                          Revoke Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
