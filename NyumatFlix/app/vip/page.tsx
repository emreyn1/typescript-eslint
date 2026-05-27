"use client";

import { Coins } from "lucide-react";

const plans = [
  { name: "1 Hour", coins: 50, desc: "Ad-free for 1 hour" },
  { name: "1 Day", coins: 200, desc: "Ad-free for 24 hours" },
  { name: "1 Week", coins: 1000, desc: "Ad-free for 7 days" },
  { name: "1 Month", coins: 3000, desc: "Ad-free for 30 days" },
];

export default function VipPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">VIP Access</h1>
      <p className="text-gray-400 mb-8">Use your earned coins to remove ads.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Coins className="text-yellow-500" size={16} />
              <span className="text-2xl font-bold">{plan.coins}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{plan.desc}</p>
            <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
