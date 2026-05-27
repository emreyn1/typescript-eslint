"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import countries from "@/data/countries";
import services from "@/data/services";
import {
  Search,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  Star,
  X,
} from "lucide-react";

/* ─── Types ────────────────────────────────────────────────── */

interface OrderRow {
  id: string;
  order_id: string;
  number: string;
  code: string | null;
  service: string;
  country: string;
  status: "awaiting" | "completed" | "cancelled";
  cost: number;
  createdAt: number; // timestamp ms
}

/* ─── Main ─────────────────────────────────────────────────── */

function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  // Form state
  const [selectedService, setSelectedService] = useState(searchParams.get("service") ?? "");
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") ?? "");
  const [countrySearch, setCountrySearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [ordering, setOrdering] = useState(false);

  // Orders table
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(
          `/sms-activations/order?service=${selectedService}&country=${selectedCountry}`
        )}`
      );
    }
  }, [authStatus, router, selectedService, selectedCountry]);

  // Load existing orders from DB on mount
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/orders/history")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.orders) return;
        const mapped: OrderRow[] = d.orders.map(
          (o: {
            id: string;
            provider_order_id: string;
            phone_number: string | null;
            sms_code: string | null;
            service_id: string;
            country_id: string;
            status: string;
            amount: number;
            created_at: string;
          }) => ({
            id: o.id,
            order_id: o.provider_order_id,
            number: o.phone_number ?? "",
            code: o.sms_code ?? null,
            service: o.service_id,
            country: o.country_id,
            status:
              o.status === "completed"
                ? "completed"
                : o.status === "cancelled"
                ? "cancelled"
                : "awaiting",
            cost: o.amount ?? 0,
            createdAt: new Date(o.created_at).getTime(),
          })
        );
        setOrders(mapped);
      })
      .catch(() => {});
  }, [authStatus]);

  // SMS polling for awaiting orders
  useEffect(() => {
    const awaiting = orders.filter((o) => o.status === "awaiting");
    if (awaiting.length === 0) return;

    const interval = setInterval(() => {
      awaiting.forEach((o) => {
        fetch("/api/sms/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: o.order_id }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (!d) return;
            if (d.sms || d.code) {
              setOrders((prev) =>
                prev.map((p) =>
                  p.order_id === o.order_id
                    ? { ...p, code: d.sms || d.code, status: "completed" }
                    : p
                )
              );
            }
          })
          .catch(() => {});
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [orders]);

  // Place order
  const placeOrder = useCallback(async () => {
    if (!selectedCountry || !selectedService || ordering) return;
    setOrdering(true);
    try {
      const priceRes = await fetch(
        `/api/sms/price?countryId=${selectedCountry}&serviceId=${selectedService}`
      );
      const priceData = await priceRes.json();
      const maxPrice = priceData?.price ? priceData.price * 1.1 : undefined;

      const res = await fetch("/api/sms/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId: selectedCountry,
          serviceId: selectedService,
          maxPrice,
          pricingOption: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      const svcName =
        services.find((s) => s.id === selectedService)?.name ?? selectedService;

      const newOrder: OrderRow = {
        id: data.order_id + "-" + Date.now(),
        order_id: data.order_id,
        number: data.number ?? "",
        code: null,
        service: selectedService,
        country: selectedCountry,
        status: "awaiting",
        cost: Number(data.cost) || 0,
        createdAt: Date.now(),
      };
      setOrders((prev) => [newOrder, ...prev]);

      setToast(`You have successfully ordered a ${svcName} number`);
      setTimeout(() => setToast(null), 5000);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Order failed");
      setTimeout(() => setToast(null), 5000);
    } finally {
      setOrdering(false);
    }
  }, [selectedCountry, selectedService, ordering]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered lists
  const filteredCountries = countrySearch
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : countries;
  const filteredServices = serviceSearch
    ? services.filter((s) =>
        s.name.toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : services;

  const popularCountries = filteredCountries.filter((c) => c.popular);
  const otherCountries = filteredCountries.filter((c) => !c.popular);
  const popularServices = filteredServices.filter((s) => s.popular);
  const otherServices = filteredServices.filter((s) => !s.popular);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container-custom py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT: Configure Order ──────────────────── */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="rounded-xl border bg-card p-6 sticky top-20">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-GetSMSNow-blue" />
                <h2 className="text-lg font-semibold text-primary">
                  Configure order
                </h2>
              </div>

              {/* Service selector */}
              <div className="mb-4">
                <label className="text-xs uppercase font-medium text-muted-foreground mb-1.5 block">
                  Service
                </label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select service" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="py-2 px-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search services..."
                          className="pl-8"
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    {popularServices.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Popular</SelectLabel>
                        {popularServices.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <Image src={s.icon} alt={s.name} width={16} height={16} className="h-4 w-4" />
                              <span>{s.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {otherServices.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        {otherServices.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <Image src={s.icon} alt={s.name} width={16} height={16} className="h-4 w-4" />
                              <span>{s.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Country search & results */}
              <div className="mb-4">
                <label className="text-xs uppercase font-medium text-muted-foreground mb-1.5 block">
                  Country
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select country" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="py-2 px-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search countries..."
                          className="pl-8"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                        />
                      </div>
                    </div>
                    {popularCountries.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Popular</SelectLabel>
                        {popularCountries.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <Image src={c.flag} alt={c.name} width={16} height={12} className="h-3 w-4 object-cover" />
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {otherCountries.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        {otherCountries.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <Image src={c.flag} alt={c.name} width={16} height={12} className="h-3 w-4 object-cover" />
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Order button */}
              <Button
                className="w-full bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90 text-white font-semibold"
                disabled={!selectedCountry || !selectedService || ordering}
                onClick={placeOrder}
              >
                {ordering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Ordering...
                  </>
                ) : (
                  "Get Number"
                )}
              </Button>

              {!session && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  <Link href="/login" className="text-GetSMSNow-blue hover:underline">
                    Log in
                  </Link>{" "}
                  or{" "}
                  <Link href="/registration" className="text-GetSMSNow-blue hover:underline">
                    Register
                  </Link>{" "}
                  for balance & order history
                </p>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Orders Table ───────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border bg-card overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[40px_1fr_100px_100px_80px_130px_70px] gap-2 px-4 py-3 bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>#</span>
                <span>Phonenumber</span>
                <span>Code</span>
                <span>Service</span>
                <span>Country</span>
                <span>Status</span>
                <span className="text-right">Cost</span>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    No orders yet. Select a service and country, then click
                    &quot;Get Number&quot;.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {orders.map((order, idx) => (
                    <OrderRowItem
                      key={order.id}
                      order={order}
                      num={orders.length - idx}
                      copiedId={copiedId}
                      onCopy={copyText}
                      onCancel={cancelOrder}
                    />
                  ))}
                </div>
              )}

              {orders.length > 0 && (
                <div className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Showing 1 to {orders.length} of {orders.length} entries
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-xs text-GetSMSNow-blue hover:underline"
                  >
                    View all in Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Order Row Component ──────────────────────────────── */

function OrderRowItem({
  order,
  num,
  copiedId,
  onCopy,
  onCancel,
}: {
  order: OrderRow;
  num: number;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onCancel: (orderId: string) => void;
}) {
  const serviceMeta = services.find((s) => s.id === order.service);
  const countryMeta = countries.find((c) => c.id === order.country);
  const serviceName = serviceMeta?.name ?? order.service;
  const countryCode = order.country.toUpperCase();

  return (
    <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
      {/* Desktop row */}
      <div className="hidden md:grid grid-cols-[40px_1fr_100px_100px_80px_130px_70px] gap-2 items-center">
        <span className="text-sm text-muted-foreground">{num}</span>

        {/* Phone number */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-medium truncate">
            {order.number || "—"}
          </span>
          {order.number && (
            <button onClick={() => onCopy(order.number, order.id)} className="p-0.5 rounded hover:bg-muted flex-shrink-0">
              {copiedId === order.id ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Code */}
        <div className="flex items-center gap-1">
          {order.code ? (
            <>
              <span className="font-mono text-sm font-bold text-green-600">{order.code}</span>
              <button onClick={() => onCopy(order.code!, order.id + "-code")} className="p-0.5 rounded hover:bg-muted flex-shrink-0">
                {copiedId === order.id + "-code" ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </>
          ) : order.status === "awaiting" ? (
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>

        {/* Service */}
        <div className="flex items-center gap-1.5">
          {serviceMeta?.icon && (
            <Image src={serviceMeta.icon} alt={serviceName} width={14} height={14} className="h-3.5 w-3.5" />
          )}
          <span className="text-sm truncate">{serviceName}</span>
        </div>

        {/* Country */}
        <span className="text-sm text-muted-foreground">{countryCode}</span>

        {/* Status */}
        <StatusBadge status={order.status} createdAt={order.createdAt} orderId={order.order_id} onCancel={onCancel} />

        {/* Cost */}
        <span className="text-sm font-medium text-right">${order.cost.toFixed(2)}</span>
      </div>

      {/* Mobile card */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {serviceMeta?.icon && (
              <Image src={serviceMeta.icon} alt={serviceName} width={18} height={18} className="h-4.5 w-4.5" />
            )}
            <span className="font-medium text-sm">{serviceName}</span>
            <span className="text-xs text-muted-foreground">{countryCode}</span>
          </div>
          <span className="text-sm font-medium">${order.cost.toFixed(2)}</span>
        </div>
        {order.number && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{order.number}</span>
            <button onClick={() => onCopy(order.number, order.id)} className="p-0.5">
              {copiedId === order.id ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} createdAt={order.createdAt} orderId={order.order_id} onCancel={onCancel} />
          {order.code && (
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-bold text-green-600">{order.code}</span>
              <button onClick={() => onCopy(order.code!, order.id + "-code")} className="p-0.5">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Status Badge with countdown ─────────────────────── */

function StatusBadge({
  status,
  createdAt,
  orderId,
  onCancel,
}: {
  status: "awaiting" | "completed" | "cancelled";
  createdAt: number;
  orderId: string;
  onCancel: (orderId: string) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== "awaiting") return;
    const tick = () => setElapsed(Math.floor((Date.now() - createdAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status, createdAt]);

  if (status === "completed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600">
        Completed
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-500">
        Cancelled
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-600">
        Awaiting SMS ({elapsed}s)
      </span>
      {elapsed >= 120 && (
        <button
          onClick={() => onCancel(orderId)}
          className="text-[10px] text-red-500 hover:text-red-600 underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

/* ─── Page wrapper with Suspense ──────────────────────── */

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
