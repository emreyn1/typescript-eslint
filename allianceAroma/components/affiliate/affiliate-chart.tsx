"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface AffiliateChartProps {
  data: { month: string; earnings: number }[]
}

export function AffiliateChart({ data }: AffiliateChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: string) => {
              const parts = value.split(" ")
              return parts[0]?.substring(0, 3) ?? value
            }}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${value} AED`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.375rem",
              color: "var(--foreground)",
              fontSize: 13,
            }}
            formatter={(value: number) => [`${value.toFixed(2)} AED`, "Earnings"]}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Bar dataKey="earnings" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
