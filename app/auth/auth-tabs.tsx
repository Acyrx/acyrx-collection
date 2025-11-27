"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailLoginForm } from "./email-login-form"
import { PhoneLoginForm } from "./phone-login-form"
import { GithubLoginButton } from "./github-login-button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone } from "lucide-react"

export function AuthTabs({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [activeTab, setActiveTab] = useState("email")

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="mt-4">
          <EmailLoginForm mode={mode} />
        </TabsContent>
        <TabsContent value="phone" className="mt-4">
          <PhoneLoginForm mode={mode} />
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <GithubLoginButton />
    </div>
  )
}
