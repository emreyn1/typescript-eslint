"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"

const HERO_PERFUMES = [
  { name: "GÉNIE", image: "/products/img812.png", slug: "genie" },
  { name: "MY WAY", image: "/products/img741.png", slug: "my-way" },
  { name: "GENIE COLLECTION", image: "/products/img814.png", slug: "genie-collection-01009" },
  { name: "OLYMPETIC", image: "/products/img743.png", slug: "olympetic-by-genie-collection" },
  { name: "GENIE COLLECTION", image: "/products/img817.png", slug: "genie-collection-8817" },
  { name: "GOOD GIRL", image: "/products/img744.png", slug: "good-girl-genie-collection" },
  { name: "GÉNIE EAU DE PARFUM", image: "/products/img831.png", slug: "genie-eau-de-parfum-9032" },
  { name: "CHANCE EAU TENDRE", image: "/products/img745.png", slug: "chance-by-genie-collection-eau-tendre" },
  { name: "GENIE COLLECTION", image: "/products/img819.png", slug: "genie-collection-5535" },
  { name: "PARADISE", image: "/products/img746.png", slug: "genie-collection-paradise" },
  { name: "BLACK OPUM", image: "/products/img754.png", slug: "black-opum-by-genie" },
  { name: "GÉNIE CODE PROFUMO", image: "/products/img880.png", slug: "genie-code-profumo" },
]

const AUTOPLAY_INTERVAL = 3000

export function HeroSection() {
  const { user } = useAuth()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
    skipSnaps: false,
  })

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(scrollNext, AUTOPLAY_INTERVAL)
    return () => clearInterval(interval)
  }, [emblaApi, scrollNext])

  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(184, 134, 11, 0.3), transparent 70%), radial-gradient(ellipse at 70% 50%, rgba(184, 134, 11, 0.15), transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 text-center lg:px-8">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-primary-foreground/60">
          Premium Fragrances by Genie Collection
        </p>
        <h1 className="font-serif text-4xl leading-tight md:text-5xl lg:text-6xl text-balance">
          Alliance Aroma
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/70 lg:text-lg">
          More than just fragrance — luxury scents crafted from the finest European oils,
          combined with a business opportunity designed for ambitious individuals.
        </p>

        <div className="relative mx-auto mt-10 w-full max-w-5xl">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-x gap-6 will-change-transform">
              {[...HERO_PERFUMES, ...HERO_PERFUMES].map((perfume, index) => (
                <div
                  key={`${perfume.slug}-${index}`}
                  className="min-w-0 shrink-0 basis-[200px] sm:basis-[220px] md:basis-[240px] lg:basis-[260px]"
                >
                  <Link href={`/collection/${perfume.slug}`} className="group flex flex-col items-center">
                    <div className="relative flex h-56 w-full items-end justify-center overflow-hidden rounded-md bg-transparent md:h-64">
                      <Image
                        src={perfume.image}
                        alt={perfume.name}
                        fill
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        sizes="260px"
                      />
                    </div>
                    <span className="mt-3 text-sm font-medium tracking-wide text-primary-foreground/90 transition-colors group-hover:text-accent">
                      {perfume.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-accent px-8 tracking-wider text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/collection">
              Explore Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground/20 bg-transparent px-8 tracking-wider text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href={user ? "/account" : "/register"}>
              {user ? "My Account" : "Join Alliance"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
