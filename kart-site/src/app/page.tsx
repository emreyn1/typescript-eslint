import Link from "next/link";
import {
  CreditCard,
  Shield,
  Zap,
  Globe,
  Lock,
  ArrowRight,
} from "lucide-react";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "PrivacyCards";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <CreditCard className="text-emerald-500" size={24} />
          <span className="font-bold text-lg">{SITE_NAME}</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1 mb-6">
          <Lock size={14} className="text-emerald-500" />
          <span className="text-emerald-500 text-sm font-medium">
            No KYC Required
          </span>
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Virtual Cards for the
          <br />
          <span className="text-emerald-500">Privacy-Conscious</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Buy virtual Visa and Mastercard cards instantly with crypto. No ID, no
          verification, no traces. Use for online shopping, subscriptions, and
          more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/buy-card"
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            Buy a Card <ArrowRight size={16} />
          </Link>
          <Link
            href="#pricing"
            className="px-8 py-3 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Zero KYC",
              desc: "No ID upload, no selfie, no address proof. Buy with crypto and use immediately.",
            },
            {
              icon: Zap,
              title: "Instant Delivery",
              desc: "Card number, CVV, and expiry delivered within seconds after payment.",
            },
            {
              icon: Globe,
              title: "Works Everywhere",
              desc: "Accepted at millions of merchants worldwide. Online and in-store with Apple Pay.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <f.icon className="text-emerald-500 mb-4" size={28} />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Card Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-1">Basic</h3>
            <p className="text-gray-400 text-sm mb-4">Online payments only</p>
            <p className="text-4xl font-bold text-emerald-500 mb-6">$8</p>
            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              <li>&#x2714; Online shopping</li>
              <li>&#x2714; Subscriptions</li>
              <li>&#x2714; $5,000 monthly limit</li>
              <li>&#x2714; Instant delivery</li>
            </ul>
            <Link
              href="/buy-card?type=basic"
              className="block text-center py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              Get Basic Card
            </Link>
          </div>
          <div className="bg-emerald-600/5 border border-emerald-500/30 rounded-xl p-8 relative">
            <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">
              Recommended
            </div>
            <h3 className="text-xl font-bold mb-1">Smart</h3>
            <p className="text-gray-400 text-sm mb-4">
              Online + offline + Apple/Google Pay
            </p>
            <p className="text-4xl font-bold text-emerald-500 mb-6">$15</p>
            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              <li>&#x2714; Everything in Basic</li>
              <li>&#x2714; Apple Pay &amp; Google Pay</li>
              <li>&#x2714; In-store NFC payments</li>
              <li>&#x2714; $10,000 monthly limit</li>
              <li>&#x2714; Booking.com, hotels, flights</li>
            </ul>
            <Link
              href="/buy-card?type=smart"
              className="block text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              Get Smart Card
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} {SITE_NAME}. For educational
          purposes only.
        </p>
      </footer>
    </div>
  );
}
