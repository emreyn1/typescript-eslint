"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Wallet,
  Snowflake,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
} from "lucide-react";

interface CardData {
  id: string;
  type: string;
  label: string;
  last_four: string;
  status: string;
  provider_card_id: string;
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>([]);
  const [balance, setBalance] = useState(0);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [topUpAmount, setTopUpAmount] = useState(25);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    Promise.all([
      fetch("/api/user/balance").then((r) => r.ok ? r.json() : { balance: 0 }),
      fetch("/api/cards").then((r) => r.ok ? r.json() : []),
    ]).then(([balData, cardsData]) => {
      setBalance(balData.balance ?? 0);
      if (Array.isArray(cardsData)) setCards(cardsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authStatus]);

  const handleTopUp = async () => {
    const res = await fetch("/api/payments/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: topUpAmount }),
    });
    const data = await res.json();
    if (data.invoice_url) {
      window.open(data.invoice_url, "_blank");
    }
  };

  const handleFreeze = async (cardId: string) => {
    const res = await fetch(`/api/cards/${cardId}/freeze`, { method: "POST" });
    if (res.ok) {
      setCards((prev) =>
        prev.map((c) =>
          c.provider_card_id === cardId
            ? { ...c, status: c.status === "frozen" ? "active" : "frozen" }
            : c
        )
      );
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <CreditCard className="text-emerald-500" size={20} />
          <span className="font-bold">Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{session?.user?.email}</span>
          <Link
            href="/buy-card"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} /> New Card
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Balance */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="text-emerald-500" size={20} />
            <span className="text-gray-400 text-sm">Account Balance</span>
          </div>
          <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-3">
            <select
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              {[10, 25, 50, 100, 250, 500].map((v) => (
                <option key={v} value={v}>${v}</option>
              ))}
            </select>
            <button
              onClick={handleTopUp}
              className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              Top Up with Crypto
            </button>
          </div>
        </div>

        {/* Cards */}
        <h2 className="text-lg font-semibold mb-4">Your Cards ({cards.length})</h2>
        {cards.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <CreditCard className="text-gray-600 mx-auto mb-3" size={40} />
            <p className="text-gray-400 mb-4">No cards yet</p>
            <Link
              href="/buy-card"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Buy Your First Card
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {cards.map((card) => (
              <div key={card.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500">{card.type}</span>
                    <p className="font-mono text-lg mt-1">•••• •••• •••• {card.last_four}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    card.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : card.status === "frozen"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {card.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetails((prev) => ({ ...prev, [card.id]: !prev[card.id] }))}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs transition-colors"
                  >
                    {showDetails[card.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showDetails[card.id] ? "Hide" : "Show"} Details
                  </button>
                  <button
                    onClick={() => handleFreeze(card.provider_card_id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs transition-colors"
                  >
                    <Snowflake size={12} />
                    {card.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
