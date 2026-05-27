"use client";

import { NavbarSearchClient } from "@/components/search/search";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "../../ui/back-button";
import { Badge } from "../../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { NavbarAuth } from "./navbar-auth";
import { NavbarLinks, type NavLinkItem } from "./navbar-links";
import { NavbarMobileNavigation } from "./navbar-mobile-navigation";

const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", href: "/home" },
  {
    label: "Movies",
    href: "/movies",
    children: [
      { label: "Discover", href: "/movies/browse", badge: "NEW" },
      { label: "Popular", href: "/movies/browse?filter=popular" },
      { label: "Now Playing", href: "/movies/browse?filter=now-playing" },
      { label: "Top Rated", href: "/movies/browse?filter=top-rated" },
    ],
  },
  {
    label: "TV Shows",
    href: "/tvshows",
    children: [
      { label: "Discover", href: "/tvshows/browse", badge: "NEW" },
      { label: "Popular", href: "/tvshows/browse?filter=popular" },
      { label: "Airing Today", href: "/tvshows/browse?filter=airing-today" },
      { label: "On The Air", href: "/tvshows/browse?filter=on-the-air" },
      { label: "Top Rated", href: "/tvshows/browse?filter=top-rated" },
    ],
  },
  {
    label: "People",
    href: "/search?type=person",
    children: [
      { label: "Popular", href: "/search?type=person" },
      { label: "Search", href: "/search" },
      { label: "Popular actors", href: "/search?type=person&gender=male" },
      { label: "Popular actresses", href: "/search?type=person&gender=female" },
      { label: "Popular directors", href: "/search?type=person&role=director" },
    ],
  },
  {
    label: "Trending",
    href: "/home",
    children: [
      { label: "Movies", href: "/movies/browse?filter=trending" },
      { label: "TV Shows", href: "/tvshows/browse?filter=trending" },
    ],
  },
];

const MOBILE_FLAT_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tvshows" },
  { label: "People", href: "/search?type=person" },
  { label: "Trending", href: "/home" },
  { label: "Search", href: "/search" },
];

interface NavbarClientProps {
  session: Session | null;
}

export const NavbarClient = ({ session }: NavbarClientProps) => {
  return (
    <>
      <nav className={cn("absolute top-0 z-50 w-full")}>
        <div className="flex justify-between items-center md:max-w-7xl lg:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:pb-8">
          <div className="flex flex-row items-center gap-2 shrink-0">
            <BackButton />
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.svg"
                alt="MovieOn Logo"
                width={150}
                height={150}
                className="size-10"
              />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 mx-8">
            <NavbarSearchClient />
          </div>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 ml-auto">
            <NavbarLinks links={NAV_LINKS} />
            <NavbarAuth session={session} />
          </div>

          <div className="flex md:hidden items-center space-x-2">
            <NavbarMobileNavigation
              links={MOBILE_FLAT_LINKS}
              session={session}
            >
              <div className="px-2">
                <NavbarSearchClient />
              </div>
            </NavbarMobileNavigation>
          </div>
        </div>
      </nav>
    </>
  );
};
