import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          MovieOn
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/movies" className="text-gray-300 hover:text-white transition-colors">Movies</Link>
          <Link href="/tv" className="text-gray-300 hover:text-white transition-colors">TV Shows</Link>
          <Link href="/search" className="text-gray-300 hover:text-white transition-colors">Search</Link>
          <Link href="/referral" className="text-indigo-400 hover:text-indigo-300 transition-colors">Earn</Link>
        </div>
      </div>
    </nav>
  );
}
