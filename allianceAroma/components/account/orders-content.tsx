"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { Loader2, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  product_id: string
}

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  order_items: OrderItem[]
}

const statusStyles: Record<string, string> = {
  paid: "bg-accent/10 text-accent",
  shipped: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
}

function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ])
}

export function OrdersContent() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (!user?.id || fetched.current) {
      setLoading(false)
      return
    }
    fetched.current = true

    async function fetchOrders() {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from("orders")
            .select("id, total, status, created_at, order_items(id, quantity, unit_price, product_id)")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
        )

        if (error) console.error("Failed to fetch orders:", error.message)
        setOrders((data as Order[]) ?? [])
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 font-serif text-lg text-foreground">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your order history will appear here once you make a purchase.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-serif text-lg text-card-foreground">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Order ID</TableHead>
              <TableHead className="text-center text-muted-foreground">Items</TableHead>
              <TableHead className="text-right text-muted-foreground">Total</TableHead>
              <TableHead className="text-right text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-border">
                <TableCell className="text-sm text-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-AE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {order.id.slice(0, 8)}…
                </TableCell>
                <TableCell className="text-center text-sm text-foreground">
                  {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-foreground">
                  {formatPrice(Number(order.total))}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={statusStyles[order.status] ?? statusStyles.pending}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
