"use client";

import { useState, useEffect } from "react";
import { Phone, Loader2, CheckCircle, XCircle, Copy } from "lucide-react";

export default function OrderPage() {
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [order, setOrder] = useState<{ order_id: string; phone: string } | null>(null);
  const [smsCode, setSmsCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ordered" | "received" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/sms/countries").then(r => r.json()).then(d => setCountries(d.countries || [])).catch(() => {});
    fetch("/api/sms/services").then(r => r.json()).then(d => setServices(d.services || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCountry && selectedService) {
      fetch(`/api/sms/price?country=${selectedCountry}&service=${selectedService}`)
        .then(r => r.json()).then(d => setPrice(d.price)).catch(() => setPrice(null));
    }
  }, [selectedCountry, selectedService]);

  async function handleOrder() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/sms/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry, service: selectedService }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrder(data);
      setStatus("ordered");
      pollForCode(data.order_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Order failed");
      setStatus("error");
    }
  }

  async function pollForCode(orderId: string) {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res = await fetch(`/api/sms/check?order_id=${orderId}`);
        const data = await res.json();
        if (data.code) {
          setSmsCode(data.code);
          setStatus("received");
          return;
        }
      } catch {}
    }
    setError("Timeout — no SMS received within 5 minutes");
    setStatus("error");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Buy a Temporary Number</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Country</label>
          <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
            <option value="">Select country</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Service</label>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
            <option value="">Select service</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {price !== null && (
          <p className="text-sm text-gray-400">Price: <span className="text-green-400 font-semibold">${price.toFixed(2)}</span></p>
        )}
      </div>

      {status === "idle" && selectedCountry && selectedService && (
        <button onClick={handleOrder} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <Phone size={16} /> Order Number
        </button>
      )}

      {status === "loading" && (
        <div className="text-center py-4 text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Ordering...
        </div>
      )}

      {status === "ordered" && order && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Your temporary number:</p>
          <p className="text-xl font-mono font-bold text-green-400 mb-4">{order.phone}</p>
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <Loader2 className="animate-spin" size={14} /> Waiting for SMS code...
          </div>
        </div>
      )}

      {status === "received" && smsCode && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-400" size={18} />
            <span className="text-green-400 font-semibold">SMS Received!</span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Your verification code:</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-mono font-bold">{smsCode}</p>
            <button onClick={() => navigator.clipboard.writeText(smsCode)} className="p-1 hover:bg-white/10 rounded">
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-2">
          <XCircle className="text-red-400" size={18} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
