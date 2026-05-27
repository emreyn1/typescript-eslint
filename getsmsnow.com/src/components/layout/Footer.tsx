"use client";

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { title: "SMS Activations", href: "/sms-activations" },
  { title: "API", href: "/api" },
  { title: "Referral Program", href: "/referral-program" },
  { title: "FAQ", href: "/faq" },
  { title: "Reach Us by Telegram", href: "https://t.me/GetSMSNow", external: true },
];

const legalLinks = [
  { title: "Terms of Use & Privacy Policy", href: "/privacy-policy" },
  { title: "Purchase Terms and Conditions", href: "/terms-of-service" },
  { title: "Refund Policy", href: "/refund-policy" },
];

export default function Footer() {
  return (
    <footer className="footer-gradient">
      <div className="container-custom py-12">
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="GetSMSNow"
                width={120}
                height={40}
                className="h-14 w-auto"
              />
            </Link>
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-4 md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noopener noreferrer" : ""}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-3">We accept cards, Apple Pay, Google Pay and 300+ cryptocurrencies</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Image
                src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/bitcoin.svg"
                alt="Bitcoin"
                width={40}
                height={16}
                className="h-6 w-auto opacity-80"
              />
              <Image
                src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/ethereum.svg"
                alt="Ethereum"
                width={40}
                height={16}
                className="h-6 w-auto opacity-80"
              />
              <Image
                src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/tether.svg"
                alt="USDT"
                width={40}
                height={16}
                className="h-6 w-auto opacity-80"
              />
              <Image
                src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/monero.svg"
                alt="Monero"
                width={40}
                height={16}
                className="h-6 w-auto opacity-80"
              />
              <Image
                src="https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/litecoin.svg"
                alt="Litecoin"
                width={40}
                height={16}
                className="h-6 w-auto opacity-80"
              />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-2 md:gap-4">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="text-xs text-muted-foreground">
                {index > 0 && <span className="mr-2">•</span>}
                <Link
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.title}
                </Link>
              </span>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            © 2018-2026 GetSMSNow. All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
