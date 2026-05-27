"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Users, Coins, TrendingUp, Gift } from "lucide-react";

const EMBED_API =
  process.env.NEXT_PUBLIC_EMBED_API_URL || "http://localhost:3001";

export default function ReferralPage() {
  const [fingerprint, setFingerprint] = useState("");
  const [balance, setBalance] = useState({
    balance: 0,
    total_earned: 0,
    total_spent: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fp =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("_fp="))
        ?.split("=")[1] || "guest";
    setFingerprint(fp);
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!fingerprint) return;
    try {
      const res = await fetch(
        `${EMBED_API}/api/v1/coins/balance?fp=${fingerprint}`,
      );
      if (res.ok) setBalance(await res.json());
    } catch {}
  }, [fingerprint]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${fingerprint}`
      : "";

  function copyLink() {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-gray-400 mb-8">
          Invite friends and earn coins. Watch content to earn more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="text-yellow-500" size={20} />
              <span className="text-gray-400 text-sm">Balance</span>
            </div>
            <p className="text-2xl font-bold">{balance.balance}</p>
            <p className="text-xs text-gray-500 mt-1">coins available</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-500" size={20} />
              <span className="text-gray-400 text-sm">Total Earned</span>
            </div>
            <p className="text-2xl font-bold">{balance.total_earned}</p>
            <p className="text-xs text-gray-500 mt-1">lifetime coins</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="text-purple-500" size={20} />
              <span className="text-gray-400 text-sm">Spent</span>
            </div>
            <p className="text-2xl font-bold">{balance.total_spent}</p>
            <p className="text-xs text-gray-500 mt-1">coins redeemed</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users size={18} /> Your Referral Link
          </h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={refLink}
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 font-mono"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Copy size={14} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Share this link. When someone signs up and watches content, you both
            earn coins.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Watch & Earn</p>
                <p className="text-sm text-gray-400">
                  Earn 1 coin per minute of watching (max 100/day)
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Invite Friends</p>
                <p className="text-sm text-gray-400">
                  Earn 20% of your referrals' coins, plus commissions down 10
                  levels
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Redeem</p>
                <p className="text-sm text-gray-400">
                  Use coins for VIP ad-free access or withdraw as crypto
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
