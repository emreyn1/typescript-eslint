"use client";

import { Globe, Users, Zap, ShieldCheck } from "lucide-react";

const stats = [
  { icon: Globe, value: "120+", label: "Countries available" },
  { icon: Users, value: "500+", label: "Services supported" },
  { icon: Zap, value: "<30s", label: "Average SMS delivery" },
  { icon: ShieldCheck, value: "100%", label: "Non-VoIP real numbers" },
];

export default function StatsBar() {
  return (
    <section className="border-y border-border/40 bg-muted/30">
      <div className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-GetSMSNow-blue/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-GetSMSNow-blue" />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
