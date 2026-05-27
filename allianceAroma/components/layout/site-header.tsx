"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingBag, User, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/lib/context/cart-context"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/affiliate-program", label: "Affiliate Program" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCart()
  const { user, logout, isLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-20 lg:px-8">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background p-6">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex">
              <span className="inline-flex items-center justify-center rounded-full bg-black p-2.5">
                <Image
                  src="/logo.png"
                  alt="Alliance Aroma"
                  width={180}
                  height={54}
                  className="h-11 w-auto"
                />
              </span>
            </Link>
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-sm tracking-wide transition-colors hover:text-accent",
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo — black tile, circular mask (rounded-full) */}
        <Link href="/" className="flex shrink-0 items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-black p-2.5 shadow-sm lg:p-3">
            <Image
              src="/logo.png"
              alt="Alliance Aroma"
              width={200}
              height={60}
              className="h-11 w-auto lg:h-14"
              priority
            />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm uppercase tracking-widest transition-colors hover:text-accent",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 lg:gap-2">
          <Button variant="ghost" size="icon" aria-label="Search" className="text-foreground" asChild>
            <Link href="/collection">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account" className="text-foreground">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground">
              {isLoading ? (
                <div className="px-2 py-3 text-center">
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </div>
              ) : user ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/account")}>
                    My Account
                  </DropdownMenuItem>
                  {user.isAffiliate && (
                    <DropdownMenuItem onSelect={() => router.push("/affiliate")}>
                      Affiliate Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => logout()}>Log out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => router.push("/login")}>
                    Sign in
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/register")}>
                    Create account
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative text-foreground">
            <Link href="/cart" aria-label={`Cart with ${itemCount} items`}>
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
