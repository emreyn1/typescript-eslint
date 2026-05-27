"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Loader2, Eye, EyeOff, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { NetworkTree } from "@/components/affiliate/network-tree"
import { toast } from "sonner"

export function ProfileContent() {
  const { user, becomeAffiliate } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [affiliateLoading, setAffiliateLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Password updated successfully.")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Account info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-card-foreground">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {user.isAffiliate ? "Affiliate Member" : "Customer"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Status */}
      {user.isAffiliate ? (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Affiliate Member</p>
                <p className="text-xs text-muted-foreground">
                  Referral code: <span className="font-mono font-medium text-accent">{user.referralCode}</span>
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/affiliate">
                Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-card-foreground">Affiliate Program</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Join our affiliate program to earn commissions on every sale you refer.
              Get your unique referral link and start earning up to 10% on direct sales
              with commissions across 10 levels.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  setAffiliateLoading(true)
                  const result = await becomeAffiliate()
                  setAffiliateLoading(false)
                  if (result.success) {
                    toast.success("Welcome to the affiliate program! Your referral link is now active.")
                  } else {
                    toast.error(result.error || "Failed to join. Please try again.")
                  }
                }}
                disabled={affiliateLoading}
              >
                {affiliateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Become an Affiliate
              </Button>
              <Button asChild variant="outline">
                <Link href="/affiliate-program">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Network */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-card-foreground">My Network</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkTree />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-card-foreground">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            <Separator className="bg-border" />
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
