"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  const { user, signOut, getUserDisplayName } = useAuth()

  if (!user) return null

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" />
          <span className="font-semibold">SecureAuth</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user.email || user.phone || getUserDisplayName()}
          </span>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
