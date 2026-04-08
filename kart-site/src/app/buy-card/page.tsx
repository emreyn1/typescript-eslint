"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BuyCardPage() {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") === "smart" ? "smart" : "basic";
  const [cardType, setCardType] = useState<"basic" | "smart">(defaultType);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const price = cardType === "basic" ? 8 : 15;

  async function handlePurchase() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: cardType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Purchase failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 border border-emerald-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-emerald-500" size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">Card Created!</h2>
          <div className="bg-black/50 rounded-lg p-4 mt-4 text-left font-mono text-sm space-y-2">
            <div>
              <span className="text-gray-500">Number:</span>{" "}
              <span className="text-white">{result.card_number}</span>
            </div>
            <div>
              <span className="text-gray-500">Expiry:</span>{" "}
              <span className="text-white">
                {result.expiry_month}/{result.expiry_year}
              </span>
            </div>
            <div>
              <span className="text-gray-500">CVV:</span>{" "}
              <span className="text-white">{result.cvv}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Save these details securely. They won&apos;t be shown again.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 block py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-2xl font-bold mb-6">Buy Virtual Card</h1>

        <div className="space-y-3 mb-6">
          {(["basic", "smart"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setCardType(type)}
              className={`w-full p-4 rounded-lg border text-left transition-colors ${
                cardType === type
                  ? "border-emerald-500/50 bg-emerald-600/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium capitalize">{type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {type === "basic"
                      ? "Online payments only"
                      : "Online + offline + Apple/Google Pay"}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-500">
                  ${type === "basic" ? 8 : 15}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Shield size={16} />
          {loading ? "Processing..." : `Pay $${price} with Crypto`}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Payment processed via NOWPayments. No personal data collected.
        </p>
      </div>
    </div>
  );
}
