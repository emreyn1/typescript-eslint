'use client';

import { Home, User, Briefcase, FileText, Mail } from 'lucide-react';
import TubeLightNavbar from "@/components/nav-bar/tubeligt-navbar";  // NAMED IMPORT!
import type { LucideIcon } from 'lucide-react';

const navItems = [
  { name: 'Home', url: '#', hash: '' },
  { name: 'Projects', url: '#projects', hash: 'projects' },
  { name: 'About', url: '#about', hash: 'about' },
  { name: 'Contact', url: '#contact', hash: 'contact' },
];

const iconMap: Record<string, LucideIcon> = {
  Home: Home,
  About: User,
  Projects: Briefcase,
  Contact: Mail,
};

export default function NavBarDemo() {
  const itemsWithIcons = navItems.map((item) => ({
    ...item,
    icon: iconMap[item.name],
  }));

  return <TubeLightNavbar items={itemsWithIcons} />;
}