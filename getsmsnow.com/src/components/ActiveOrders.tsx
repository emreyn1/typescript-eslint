"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Copy, Check, Loader2, MessageCircle, X } from "lucide-react";

interface ActiveOrder {
  id: string;
  provider_order_id: string;
  country_id: string;
  service_id: string;
  phone_number: string | null;
  status: string;
  sms_code: string | null;
  created_at: string;
}

interface SmsCheckResult {
  status?: string;
  sms?: string;
  full_sms?: string;
  code?: string;
}

export default function ActiveOrders() {
  const { status } = useSession();
  const pathname = usePathname();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [smsResults, setSmsResults] = useState<Record<string, SmsCheckResult>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/active");
      if (!res.ok) return;
      const data = await res.json();
      if (data.orders?.length > 0) setOrders(data.orders);
      else setOrders([]);
    } catch { /* ignore */ }
  }, []);

  const checkSms = useCallback(async (orderId: string) => {
    try {
      const res = await fetch("/api/sms/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) return;
      const data: SmsCheckResult = await res.json();
      if (data.sms || data.code || data.full_sms) {
        setSmsResults((prev) => ({ ...prev, [orderId]: data }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [status, fetchOrders]);

  useEffect(() => {
    if (orders.length === 0) return;
    const pending = orders.filter(
      (o) => o.status === "active" && !smsResults[o.provider_order_id]
    );
    if (pending.length === 0) return;

    pending.forEach((o) => checkSms(o.provider_order_id));
    const interval = setInterval(() => {
      pending.forEach((o) => {
        if (!smsResults[o.provider_order_id]) checkSms(o.provider_order_id);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [orders, smsResults, checkSms]);

  const copyNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isOrderPage = pathname?.startsWith("/sms-activations/order");
  if (status !== "authenticated" || orders.length === 0 || dismissed || isOrderPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-2xl">
      <div className="container-custom py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-GetSMSNow-blue" />
            Active Orders ({orders.length})
          </h3>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs text-GetSMSNow-blue hover:underline"
            >
              View all
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {orders.map((order) => {
            const sms = smsResults[order.provider_order_id];
            const hasCode = !!(sms?.sms || sms?.code);

            return (
              <div
                key={order.id}
                className={`flex-shrink-0 rounded-lg border p-3 min-w-[260px] max-w-[320px] transition-colors ${
                  hasCode
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {order.country_id.toUpperCase()} · {order.service_id}
                  </span>
                  {!hasCode && (
                    <Loader2 className="w-3 h-3 text-GetSMSNow-blue animate-spin" />
                  )}
                  {hasCode && (
                    <span className="text-[10px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                      SMS received
                    </span>
                  )}
                </div>

                {order.phone_number && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold">
                      {order.phone_number}
                    </span>
                    <button
                      onClick={() => copyNumber(order.phone_number!, order.id)}
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

                {hasCode && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-green-600">
                      {sms?.sms || sms?.code}
                    </span>
                    <button
                      onClick={() =>
                        copyNumber(String(sms?.sms || sms?.code), order.id + "-sms")
                      }
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

                {!hasCode && !order.phone_number && (
                  <p className="text-xs text-muted-foreground">Waiting for number...</p>
                )}

                {!hasCode && order.phone_number && (
                  <p className="text-xs text-muted-foreground">Waiting for SMS...</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
