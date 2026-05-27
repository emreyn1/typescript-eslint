'use client';

import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const socialLinks = useMemo(() => [
    {
      icon: Github,
      href: 'https://github.com/emreyn1',
      label: 'GitHub',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/in/emrehallacc/',
      label: 'LinkedIn',
    },
    {
      icon: Mail,
      href: 'mailto:arifhallacc@gmail.com',
      label: 'Email',
    },
  ], []);

  const quickLinks = useMemo(() => [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ], []);

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Emre Hallac
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Full stack web developer passionate about creating beautiful, functional, and user-centered digital experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Connect</h4>
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            © {currentYear} Emre Hallac. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500" /> using Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}

