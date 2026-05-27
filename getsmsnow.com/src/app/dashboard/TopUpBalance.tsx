"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";

export function TopUpBalance() {
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minAmount = 5;
  const handleTopUp = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < minAmount || num > 10000) {
      setError("Enter amount between 5 and 10,000");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nowpayments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      const url = typeof data.url === "string" ? data.url.trim() : "";
      if (url) window.location.assign(url);
      else setError("Payment URL not received");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-GetSMSNow-blue bg-GetSMSNow-blue/10 px-3 py-2 text-sm text-GetSMSNow-blue w-fit">
        <Wallet className="h-4 w-4" />
        Pay with Crypto (300+ coins)
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          min={minAmount}
          max={10000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (USD)"
          className="max-w-[120px]"
        />
        <Button
          onClick={handleTopUp}
          disabled={loading}
          className="bg-GetSMSNow-blue hover:bg-GetSMSNow-blue/90"
        >
          {loading ? "Processing..." : "Top Up"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Pay with BTC, USDT, ETH, LTC, TRX and 300+ cryptocurrencies via NOWPayments
      </p>
    </div>
  );
}
