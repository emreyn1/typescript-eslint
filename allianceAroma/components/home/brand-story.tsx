import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export function BrandStory() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Our Story</p>
            <h2 className="font-serif text-3xl md:text-4xl text-balance">More Than Just Fragrance</h2>
            <Separator className="my-6 w-16 bg-accent" />
            <p className="text-base leading-relaxed text-muted-foreground">
              Alliance Aroma is a premium networking-inspired perfume brand built on the power of
              connection, confidence, and opportunity. We combine luxury scents with a direct selling
              business opportunity designed for ambitious individuals who want additional income and
              personal growth.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Powered by Genie Collection — a specialized company with trademarks registered in more
              than 75 countries — our perfumes are manufactured from the finest European oils
              (French, Spanish, and Italian) at competitive and attractive prices.
            </p>
            <div className="mt-8 flex gap-12">
              <div>
                <p className="font-serif text-3xl text-accent">75+</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Countries</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-accent">100+</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Fragrances</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-accent">2013</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Since</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="aspect-square w-full max-w-md overflow-hidden rounded-sm bg-primary">
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Alliance Aroma"
                  fill
                  className="object-contain p-10"
                  sizes="400px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
