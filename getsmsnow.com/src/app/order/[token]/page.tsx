"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface GuestOrder {
  guest_token: string;
  country_id: string;
  service_id: string;
  amount: number;
  status: string;
  phone_number: string | null;
  provider_order_id: string | null;
  created_at: string;
}

export default function GuestOrderPage() {
  const params = useParams();
  const token = params?.token as string | undefined;

  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [sms, setSms] = useState<string | null>(null);
  const [fullSms, setFullSms] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`/api/guest/order/${token}`);
    if (!res.ok) {
      setError("Order not found");
      return;
    }
    const data = await res.json();
    setOrder(data);
    setError(null);
  }, [token]);

  const checkSms = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`/api/guest/order/${token}/sms`);
    if (!res.ok) return;
    const data = await res.json();
    if (data?.sms) setSms(data.sms);
    if (data?.full_sms) setFullSms(data.full_sms);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Invalid link");
      return;
    }
    fetchOrder();
  }, [token, fetchOrder]);

  useEffect(() => {
    if (order?.status !== "active" && order?.status !== "completed" || !order?.provider_order_id || sms) return;
    const interval = setInterval(checkSms, 4000);
    checkSms();
    return () => clearInterval(interval);
  }, [order?.status, order?.provider_order_id, sms, checkSms]);

  const copyNumber = () => {
    if (!order?.phone_number) return;
    navigator.clipboard.writeText(order.phone_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <div className="header-gradient min-h-screen py-12 flex items-center justify-center">
        <p className="text-muted-foreground">Invalid order link.</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="header-gradient min-h-screen py-12">
        <div className="container-custom max-w-md mx-auto text-center">
          <p className="text-red-500">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/">Go to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="header-gradient min-h-screen py-12 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const showNumber = order.status === "active" || order.status === "completed";
  const waitingPayment = order.status === "pending_payment";

  return (
    <div className="header-gradient min-h-screen py-12">
      <div className="container-custom max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-2">Your order</h1>

        {waitingPayment && (
          <div className="rounded-lg border bg-amber-500/10 border-amber-500/30 p-4 mb-4">
            <p className="text-sm">
              Payment is being processed. This page will update when your number is ready. You can close and return later using the same link.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Bookmark this page or save the link: <code className="break-all text-xs">{typeof window !== "undefined" ? window.location.href : ""}</code>
            </p>
          </div>
        )}

        {showNumber && order.phone_number && (
          <div className="rounded-lg border bg-card p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Phone number</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-semibold">{order.phone_number}</span>
              <Button variant="outline" size="icon" onClick={copyNumber} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this number in the app to receive the verification code.
            </p>
          </div>
        )}

        {(order.status === "active" || order.status === "completed") && (
          <div className="rounded-lg border bg-card p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">SMS / Code</p>
            {sms ? (
              <p className="font-mono text-lg break-all">{sms}</p>
            ) : fullSms ? (
              <p className="font-mono text-sm break-all">{fullSms}</p>
            ) : (
              <p className="text-muted-foreground">Waiting for SMS... (updates every few seconds)</p>
            )}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-GetSMSNow-blue hover:underline">Get another number</Link>
          {" · "}
          <Link href="/registration" className="text-GetSMSNow-blue hover:underline">Register for history</Link>
        </div>
      </div>
    </div>
  );
}
