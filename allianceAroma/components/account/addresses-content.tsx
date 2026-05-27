"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Loader2, Plus, MapPin, Star, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Address {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  country: string
  postal_code: string | null
  phone: string | null
  is_default: boolean
}

const emptyForm: Omit<Address, "id"> = {
  label: "Home",
  line1: "",
  line2: null,
  city: "",
  state: null,
  country: "UAE",
  postal_code: null,
  phone: null,
  is_default: false,
}

function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ])
}

export function AddressesContent() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Address, "id">>(emptyForm)
  const initialFetched = useRef(false)

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false })
      )

      if (error) console.error("Failed to fetch addresses:", error.message)
      setAddresses((data as Address[]) ?? [])
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (initialFetched.current) return
    initialFetched.current = true
    fetchAddresses()
  }, [fetchAddresses])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(address: Address) {
    setEditingId(address.id)
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postal_code,
      phone: address.phone,
      is_default: address.is_default,
    })
    setDialogOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)

    if (form.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
    }

    if (editingId) {
      const { error } = await supabase
        .from("addresses")
        .update({
          label: form.label,
          line1: form.line1,
          line2: form.line2 || null,
          city: form.city,
          state: form.state || null,
          country: form.country,
          postal_code: form.postal_code || null,
          phone: form.phone || null,
          is_default: form.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)

      setSaving(false)
      if (error) {
        toast.error("Failed to update address.")
        return
      }
      toast.success("Address updated.")
    } else {
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: form.label,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        state: form.state || null,
        country: form.country,
        postal_code: form.postal_code || null,
        phone: form.phone || null,
        is_default: form.is_default,
      })

      setSaving(false)
      if (error) {
        toast.error("Failed to save address.")
        return
      }
      toast.success("Address added.")
    }

    setDialogOpen(false)
    fetchAddresses()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("addresses").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete address.")
      return
    }
    toast.success("Address removed.")
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleSetDefault(id: string) {
    if (!user?.id) return

    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      toast.error("Failed to set default address.")
      return
    }

    toast.success("Default address updated.")
    fetchAddresses()
  }

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-foreground">Saved Addresses</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingId ? "Edit Address" : "Add Address"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your shipping address details."
                  : "Add a new shipping address to your account."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addr-label">Label</Label>
                  <Input
                    id="addr-label"
                    value={form.label}
                    onChange={(e) => updateForm("label", e.target.value)}
                    placeholder="e.g. Home, Office"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-phone">Phone</Label>
                  <Input
                    id="addr-phone"
                    value={form.phone ?? ""}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="+971 XX XXX XXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-line1">Address Line 1</Label>
                <Input
                  id="addr-line1"
                  value={form.line1}
                  onChange={(e) => updateForm("line1", e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-line2">Address Line 2</Label>
                <Input
                  id="addr-line2"
                  value={form.line2 ?? ""}
                  onChange={(e) => updateForm("line2", e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addr-city">City</Label>
                  <Input
                    id="addr-city"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    placeholder="Dubai"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-state">State / Emirate</Label>
                  <Input
                    id="addr-state"
                    value={form.state ?? ""}
                    onChange={(e) => updateForm("state", e.target.value)}
                    placeholder="Dubai"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addr-country">Country</Label>
                  <Input
                    id="addr-country"
                    value={form.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                    placeholder="UAE"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-postal">Postal Code</Label>
                  <Input
                    id="addr-postal"
                    value={form.postal_code ?? ""}
                    onChange={(e) => updateForm("postal_code", e.target.value)}
                    placeholder="00000"
                  />
                </div>
              </div>
              <Separator className="bg-border" />
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => updateForm("is_default", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Set as default address
              </label>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Add Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-serif text-lg text-foreground">No addresses saved</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a shipping address for faster checkout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="border-border bg-card">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {address.label}
                  </CardTitle>
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                      <Star className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(address)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {address.city}
                    {address.state ? `, ${address.state}` : ""}
                    {address.postal_code ? ` ${address.postal_code}` : ""}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && <p className="mt-1">{address.phone}</p>}
                </div>
                {!address.is_default && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-3 h-auto p-0 text-xs text-muted-foreground hover:text-accent"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
