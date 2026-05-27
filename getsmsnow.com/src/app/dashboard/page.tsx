"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { TopUpBalance } from "./TopUpBalance";
import { OrdersList } from "./OrdersList";
import { Wallet, ShoppingCart, ArrowRight, RotateCcw, Copy, Check, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  provider_order_id: string;
  country_id: string;
  service_id: string;
  amount: number;
  status: string;
  phone_number: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [smsResults, setSmsResults] = useState<Record<string, { status?: string; sms?: string; code?: string }>>({});

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/user/balance")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { balance?: number }) => setBalance(d.balance ?? 0))
      .catch(() => setBalance(0))
      .finally(() => setLoadingBalance(false));

    const fetchOrders = () => {
      fetch("/api/orders/history")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: { orders?: Order[] }) => setOrders(d.orders ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    };
    fetchOrders();
    const orderInterval = setInterval(fetchOrders, 15000);
    return () => clearInterval(orderInterval);
  }, [status]);

  useEffect(() => {
    const active = orders.filter((o) => (o.status === "active" || o.status === "pending") && !smsResults[o.provider_order_id]);
    if (active.length === 0) return;

    const checkAll = () => {
      active.forEach((o) => {
        fetch("/api/sms/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: o.provider_order_id }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.sms || d?.code) {
              setSmsResults((prev) => ({ ...prev, [o.provider_order_id]: d }));
            }
          })
          .catch(() => {});
      });
    };
    checkAll();
    const smsInterval = setInterval(checkAll, 5000);
    return () => clearInterval(smsInterval);
  }, [orders, smsResults]);

  if (status === "loading") {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-primary">Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to view your balance, orders, and manage your account.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/registration">Register</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/guest/checkout" className="text-GetSMSNow-blue hover:underline">
            Use guest checkout
          </Link>{" "}
          to buy a number without registering.
        </p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {session?.user?.email ?? "User"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-GetSMSNow-blue/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-GetSMSNow-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className="text-2xl font-bold text-primary">
                {loadingBalance ? "..." : `$${(balance ?? 0).toFixed(2)}`}
              </p>
            </div>
          </div>
          <TopUpBalance />
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-primary">
                {loadingOrders ? "..." : orders.length}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/sms-activations" className="flex items-center justify-center gap-2">
              Buy Number <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Referrals</p>
              <p className="text-2xl font-bold text-primary">—</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/referral-program" className="flex items-center justify-center gap-2">
              Earn with Referrals <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="rounded-xl border bg-card mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Quick Re-order
            </h2>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {Array.from(new Set(orders.map((o) => `${o.country_id}|${o.service_id}`))).slice(0, 6).map((combo) => {
              const [cid, sid] = combo.split("|");
              return (
                <Button key={combo} variant="outline" size="sm" asChild>
                  <Link href={`/sms-activations/order?country=${cid}&service=${sid}&period=10min`}>
                    {cid.toUpperCase()} · {sid}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Phone className="w-5 h-5" /> My Numbers
          </h2>
          <span className="text-xs text-muted-foreground">{orders.length} total</span>
        </div>
        <div className="divide-y">
          {loadingOrders ? (
            <div className="p-6 animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Button asChild>
                <Link href="/sms-activations">Get Your First Number</Link>
              </Button>
            </div>
          ) : (
            orders.map((order) => {
              const sms = smsResults[order.provider_order_id];
              const isActive = order.status === "active" || order.status === "pending";
              const hasCode = !!(sms?.sms || sms?.code || order.phone_number);

              return (
                <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    order.status === "completed" ? "bg-green-500/10" :
                    isActive ? "bg-GetSMSNow-blue/10" : "bg-muted"
                  }`}>
                    {isActive && !sms?.sms ? (
                      <Loader2 className="w-5 h-5 text-GetSMSNow-blue animate-spin" />
                    ) : (
                      <Phone className={`w-5 h-5 ${
                        order.status === "completed" ? "text-green-500" :
                        isActive ? "text-GetSMSNow-blue" : "text-muted-foreground"
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {order.country_id} · {order.service_id}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        order.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
                        isActive ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                        order.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    {order.phone_number && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {order.phone_number}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.phone_number!);
                            setCopiedId(order.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="p-0.5 rounded hover:bg-muted"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}
                    {(sms?.sms || sms?.code) && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-green-600">
                          SMS: {sms.sms || sms.code}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(sms.sms || sms.code));
                            setCopiedId(order.id + "-sms");
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="p-0.5 rounded hover:bg-muted"
                        >
                          {copiedId === order.id + "-sms" ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-primary">${order.amount?.toFixed(2) ?? "0.00"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
