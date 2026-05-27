"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  hash?: string
  icon: LucideIcon
}

interface TubeLightNavbarProps {
  items: NavItem[]
  className?: string
}

export default function TubeLightNavbar({ items, className }: TubeLightNavbarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name || "")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Smooth scroll için CSS ekle
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth'
    }

    // İlk yüklemede hash varsa scroll yapma - sadece aktif tab'ı güncelle
    const initialHash = window.location.hash
    if (initialHash) {
      const item = items.find(i => i.hash === initialHash.slice(1))
      if (item) {
        setActiveTab(item.name)
      }
    }

    // Hash değişikliklerini dinle
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        const item = items.find(i => i.hash === hash.slice(1))
        if (item) {
          setActiveTab(item.name)
        }
      }
    }

    // Scroll sırasında aktif section'ı belirle
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      // Eğer sayfa en üstteyse Home'u aktif yap
      if (scrollPosition < 100) {
        setActiveTab('Home')
        return
      }

      const sections = items
        .filter(item => item.hash)
        .map(item => {
          const element = document.getElementById(item.hash!)
          return { element, name: item.name, hash: item.hash! }
        })

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element) {
          const offsetTop = section.element.offsetTop
          if (scrollPosition >= offsetTop) {
            setActiveTab(section.name)
            break
          }
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('scroll', handleScroll)
    // İlk yüklemede scroll kontrolü yap ama hash varsa scroll yapma
    if (!initialHash) {
      handleScroll() // Sadece hash yoksa ilk scroll kontrolü yap
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [items])

  return (
    <div className={cn("z-50 py-0 flex justify-center", className)}>
      <div className="flex items-center gap-3 bg-background/5 border border-[hsl(var(--border))] backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={(e) => {
                if (item.hash) {
                  e.preventDefault()
                  const element = document.getElementById(item.hash)
                  if (element) {
                    const offsetTop = element.offsetTop - 80 // Navbar yüksekliği için
                    window.scrollTo({
                      top: offsetTop,
                      behavior: 'smooth'
                    })
                  }
                } else if (item.url === '#') {
                  // Home'a tıklandığında sayfanın en üstüne git
                  e.preventDefault()
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  })
                }
                setActiveTab(item.name)
              }}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-6 py-2 rounded-full transition-all duration-300",
                "text-foreground/80 hover:text-foreground",
                isActive && "text-foreground"
              )}
            >
              {/* Text or Icon */}
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={20} strokeWidth={2.5} />
              </span>

              {/* Tube Light Effect */}
              {isActive && (
                <motion.div
                  layoutId="tubeLightLamp"
                  className="absolute inset-0 -z-10 pointer-events-none"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  {/* Ana lamba çizgisi */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white rounded-t-full" />

                  {/* Glow ve blur efektleri */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-10 bg-white/40 rounded-full blur-xl" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/30 rounded-full blur-lg" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/20 rounded-full blur-md" />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-6 bg-white/25 rounded-full blur-md" />
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}