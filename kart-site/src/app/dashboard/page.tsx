"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Wallet,
  MoreVertical,
  Snowflake,
  Eye,
  EyeOff,
} from "lucide-react";

export default function DashboardPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCards(data);
      })
      .catch(() => {});
  }, []);

  function toggleDetails(cardId: string) {
    setShowDetails((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <CreditCard className="text-emerald-500" size={20} />
          <span className="font-bold">Dashboard</span>
        </Link>
        <Link
          href="/buy-card"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={14} /> New Card
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Balance */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="text-emerald-500" size={20} />
            <span className="text-gray-400 text-sm">Account Balance</span>
          </div>
          <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
          <button
            className="mt-3 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            onClick={async () => {
              const res = await fetch("/api/payments/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 25 }),
              });
              const data = await res.json();
              if (data.invoice_url) {
                window.open(data.invoice_url, "_blank");
              }
            }}
          >
            + Top Up with Crypto
          </button>
        </div>

        {/* Cards */}
        <h2 className="text-lg font-semibold mb-4">Your Cards</h2>
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
              <div
                key={card.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500">
                      {card.type}
                    </span>
                    <p className="font-mono text-lg mt-1">
                      •••• •••• •••• {card.last_four}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      card.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {card.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDetails(card.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs transition-colors"
                  >
                    {showDetails[card.id] ? (
                      <EyeOff size={12} />
                    ) : (
                      <Eye size={12} />
                    )}
                    {showDetails[card.id] ? "Hide" : "Show"} Details
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs transition-colors">
                    <Snowflake size={12} />
                    Freeze
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
