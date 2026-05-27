"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  provider_order_id: string;
  country_id: string;
  service_id: string;
  amount: number;
  status: string;
  phone_number: string | null;
  created_at: string;
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const [cancelling, setCancelling] = useState<string | null>(null);

  const handleCancel = async (orderId: string) => {
    setCancelling(orderId);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.reload();
    } catch {
      setCancelling(null);
    }
  };

  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">No orders yet. Get your first number from SMS Activations.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Country</th>
            <th className="py-2 font-medium">Service</th>
            <th className="py-2 font-medium">Number</th>
            <th className="py-2 font-medium">Amount</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b">
              <td className="py-2 text-muted-foreground">
                {new Date(o.created_at).toLocaleDateString()}
              </td>
              <td className="py-2">{o.country_id}</td>
              <td className="py-2">{o.service_id}</td>
              <td className="py-2 font-mono">{o.phone_number ?? "-"}</td>
              <td className="py-2">${Number(o.amount).toFixed(2)}</td>
              <td className="py-2">
                <span
                  className={
                    o.status === "active"
                      ? "text-yellow-600"
                      : o.status === "completed"
                        ? "text-green-600"
                        : "text-muted-foreground"
                  }
                >
                  {o.status}
                </span>
              </td>
              <td className="py-2">
                {o.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(o.provider_order_id)}
                    disabled={cancelling === o.provider_order_id}
                  >
                    {cancelling === o.provider_order_id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
