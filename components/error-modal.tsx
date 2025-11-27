"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  details?: string
}

export function ErrorModal({ isOpen, onClose, title = "Authentication Error", message, details }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-sm">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/20 border border-destructive/30">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-left">{message}</DialogDescription>
          {details && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground font-mono">{details}</p>
            </div>
          )}
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Try Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
