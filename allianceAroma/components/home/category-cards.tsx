import Link from "next/link"
import Image from "next/image"

const categories = [
  {
    name: "25ml Collection",
    price: "35 AED",
    description: "Compact luxury — perfect for travel and discovery",
    image: "/products/img812.png",
    href: "/collection?category=25ml+Collection",
  },
  {
    name: "85ml Collection",
    price: "120 AED",
    description: "Full-size elegance — your signature statement",
    image: "/products/img741.png",
    href: "/collection?category=85ml+Collection",
  },
]

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop by</p>
        <h2 className="font-serif text-3xl md:text-4xl">Our Collections</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-sm bg-transparent p-8 transition-shadow hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-[1]" />
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="relative z-10">
              <h3 className="font-serif text-2xl text-white">{cat.name}</h3>
              <p className="mt-1 text-sm text-white/80">{cat.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  From {cat.price}
                </span>
                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-white/80 transition-colors group-hover:text-accent">
                  Explore <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
