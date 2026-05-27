"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown, User, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navLinks = [
  { title: "SMS Activations", href: "/sms-activations" },
  { title: "API", href: "/api" },
  { title: "Referral Program", href: "/referral-program" },
  { title: "FAQ", href: "/faq", homeAnchor: "faq" as const },
];

const languages = [
  { code: "en", name: "English", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/us.svg" },
  { code: "zh", name: "Chinese", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/cn.svg" },
  { code: "es", name: "Spanish", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/es.svg" },
  { code: "hi", name: "Hindi", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/in.svg" },
  { code: "ru", name: "Russian", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ru.svg" },
  { code: "tr", name: "Turkish", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tr.svg" },
  { code: "ar", name: "Arabic", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sa.svg" },
  { code: "fr", name: "French", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/fr.svg" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getLinkHref = (link: (typeof navLinks)[number]) => {
    if ("homeAnchor" in link && link.homeAnchor && pathname === "/") {
      return `/#${link.homeAnchor}`;
    }
    return link.href;
  };

  return (
    <nav className="border-b border-border/40 bg-background">
      <div className="container-custom py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="focus:outline-none">
            <img
              src="/logo.png"
              alt="GetSMSNow"
              width={170}
              height={40}
              className="h-9 w-auto rounded-md"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getLinkHref(link)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex gap-1 items-center">
                <Globe className="h-4 w-4 mr-1" />
                EN
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang.code} className="cursor-pointer">
                  <Image
                    src={lang.flag}
                    alt={lang.name}
                    width={20}
                    height={15}
                    className="mr-2 rounded-sm object-cover w-5 h-[15px]"
                  />
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => signOut()}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" className="bg-GetSMSNow-red hover:bg-GetSMSNow-red/90" asChild>
                  <Link href="/registration">Registration</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 border-t border-border/40 pt-2 bg-background">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getLinkHref(link)}
                className="text-sm py-2 text-primary hover:text-primary/80 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}

            <div className="md:hidden pt-2 flex items-center gap-2">
              {session ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard" className="flex items-center justify-center gap-1">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full" onClick={() => signOut()}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/login" className="flex items-center justify-center gap-1">
                      <User className="h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full bg-GetSMSNow-red hover:bg-GetSMSNow-red/90" asChild>
                    <Link href="/registration">Registration</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden pt-2 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full flex gap-1 justify-center items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    EN
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} className="cursor-pointer">
                      <Image
                        src={lang.flag}
                        alt={lang.name}
                        width={20}
                        height={15}
                        className="mr-2 rounded-sm object-cover w-5 h-[15px]"
                      />
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
