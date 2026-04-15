"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Users, Copy, Check, TrendingUp } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const COMMISSION_RATES = [
  { level: 1, rate: "10%", desc: "Direct referral" },
  { level: 2, rate: "5%", desc: "2nd level" },
  { level: 3, rate: "3%", desc: "3rd level" },
];

export default function ReferralPage() {
  const [refCode, setRefCode] = useState("");
  const [stats, setStats] = useState({ directRefs: 0, totalEarned: 0 });
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabaseBrowser?.auth.getSession() ?? {
        data: { session: null },
      };
      if (!data.session?.user) return;
      if (cancelled) return;
      setUser(data.session.user);

      const token = data.session.access_token;
      const res = await fetch("/api/referral/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const code =
          data.session.user.user_metadata?.ref_code_own ||
          data.session.user.id.slice(0, 8).toUpperCase();
        setRefCode(code);
        return;
      }
      const stats = await res.json();
      if (cancelled) return;
      if (stats.code) setRefCode(stats.code);
      else
        setRefCode(
          data.session.user.id.replace(/-/g, "").slice(0, 10).toUpperCase(),
        );
      setStats({
        directRefs: stats.directRefs ?? 0,
        totalEarned: stats.totalEarned ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${refCode}`
    : "";

  function copyLink() {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <CreditCard className="text-emerald-500" size={20} />
          <span className="font-bold">Referral Program</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-500/30 rounded-xl p-8 mb-8">
          <h1 className="text-2xl font-bold mb-2">Earn With Every Referral</h1>
          <p className="text-gray-400 mb-6">
            Share your link. When someone buys a card, you earn commission on
            every transaction — up to 3 levels deep.
          </p>

          <div className="flex gap-2">
            <input
              readOnly
              value={refLink}
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Users size={16} /> Direct Referrals
            </div>
            <p className="text-3xl font-bold">{stats.directRefs}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <TrendingUp size={16} /> Total Earned
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              ${stats.totalEarned.toFixed(2)}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Commission Structure</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-gray-400 font-medium">
                  Level
                </th>
                <th className="text-left px-6 py-3 text-gray-400 font-medium">
                  Commission
                </th>
                <th className="text-left px-6 py-3 text-gray-400 font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_RATES.map((r) => (
                <tr key={r.level} className="border-b border-white/5">
                  <td className="px-6 py-3">Level {r.level}</td>
                  <td className="px-6 py-3 text-emerald-400 font-medium">
                    {r.rate}
                  </td>
                  <td className="px-6 py-3 text-gray-400">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
