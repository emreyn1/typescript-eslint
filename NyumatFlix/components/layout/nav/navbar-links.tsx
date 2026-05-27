"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface NavLinkChild {
  label: string;
  href: string;
  badge?: string;
}

export interface NavLinkItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavLinkChild[];
}

interface NavbarLinksProps {
  links: NavLinkItem[];
  isMobile?: boolean;
  onMobileLinkClick?: () => void;
}

export const NavbarLinks = ({
  links,
  isMobile = false,
  onMobileLinkClick,
}: NavbarLinksProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActiveLink = useCallback(
    (href: string) => {
      if (!isMounted) return false;
      if (href === "/") return pathname === "/";
      const base = href.split("?")[0];
      return pathname.startsWith(base);
    },
    [isMounted, pathname],
  );

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  if (isMobile) {
    return (
      <div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-3 py-3 rounded-md text-base font-medium transition-all duration-200",
              isActiveLink(link.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
            onClick={onMobileLinkClick}
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div ref={navRef} className="group flex items-center flex-nowrap">
      {links.map((link, index) => {
        const isActive = isActiveLink(link.href);
        const hasDropdown = link.children && link.children.length > 0;
        const isOpen = openDropdown === link.label;
        const isHomeLink = link.label === "Home";
        const isRightAligned = index >= links.length - 2;

        return (
          <div
            key={link.label}
            className="relative"
            onMouseEnter={() => hasDropdown && handleMouseEnter(link.label)}
            onMouseLeave={() => hasDropdown && handleMouseLeave()}
          >
            <div className="flex items-center">
              <Link
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "text-white font-semibold drop-shadow-lg"
                    : "text-white/80 hover:text-white font-medium drop-shadow-md hover:drop-shadow-lg",
                  "after:absolute after:bottom-0 after:left-1/2 after:w-3/4 after:h-px after:bg-pink-500 after:origin-center after:-translate-x-1/2 after:transition-transform after:duration-300 after:ease-in-out",
                  isActive
                    ? "after:scale-x-100 group-hover:after:scale-x-0"
                    : "after:scale-x-0 hover:after:scale-x-100",
                  isHomeLink && "hidden lg:inline",
                )}
                onMouseEnter={() => router.prefetch(link.href)}
              >
                {link.label}
              </Link>
              {hasDropdown && (
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(isOpen ? null : link.label)
                  }
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    isOpen
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                  aria-label={`${link.label} submenu`}
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              )}
            </div>

            {hasDropdown && isOpen && (
              <div
                className={cn(
                  "absolute top-full mt-2 min-w-[320px] rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl p-4 z-[999]",
                  isRightAligned ? "right-0" : "left-0",
                )}
                onMouseEnter={() => handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <p className="text-sm font-semibold text-white/50 px-2 pb-3">
                  {link.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {link.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {child.label}
                      {child.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-primary/30"
                        >
                          {child.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
