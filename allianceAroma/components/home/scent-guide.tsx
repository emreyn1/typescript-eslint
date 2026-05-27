import { Sparkles, Award, Globe, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Manufactured from the finest French, Spanish, and Italian oils for lasting elegance.",
  },
  {
    icon: Globe,
    title: "75+ Countries",
    description: "Genie Collection trademark registered in over 75 countries including the European Union.",
  },
  {
    icon: TrendingUp,
    title: "Business Opportunity",
    description: "Earn through direct selling with up to 40% discount and a 10-level affiliate program.",
  },
  {
    icon: Award,
    title: "Trusted Since 2013",
    description: "From Al Quoz market to major UAE malls — built on dedication, innovation, and trust.",
  },
]

export function ScentGuide() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Why Choose Us</p>
          <h2 className="font-serif text-3xl md:text-4xl text-balance">The Alliance Aroma Difference</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            More than just perfume — a lifestyle brand that combines luxury fragrance with a
            powerful business opportunity.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="flex flex-col items-center rounded-sm bg-card p-8 text-center transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-serif text-lg text-card-foreground">{benefit.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
