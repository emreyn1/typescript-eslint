export interface Affiliate {
  id: string
  name: string
  email: string
  referralCode: string
  joinedDate: string
  stats: {
    totalClicks: number
    conversions: number
    earnings: number
    conversionRate: number
  }
  monthlyEarnings: { month: string; earnings: number }[]
  referralHistory: {
    id: string
    date: string
    productName: string
    orderTotal: number
    commission: number
    status: "Pending" | "Paid" | "Processing"
  }[]
}

export const COMMISSION_RATE = 0.1 // 10%
export const COOKIE_DAYS = 30

export const mockAffiliates: Affiliate[] = [
  {
    id: "aff-1",
    name: "Sarah Laurent",
    email: "sarah@example.com",
    referralCode: "SARAH20",
    joinedDate: "2025-03-15",
    stats: {
      totalClicks: 1243,
      conversions: 87,
      earnings: 2845.5,
      conversionRate: 7.0,
    },
    monthlyEarnings: [
      { month: "Aug 2025", earnings: 320 },
      { month: "Sep 2025", earnings: 415 },
      { month: "Oct 2025", earnings: 580 },
      { month: "Nov 2025", earnings: 490 },
      { month: "Dec 2025", earnings: 620 },
      { month: "Jan 2026", earnings: 420.5 },
    ],
    referralHistory: [
      { id: "ref-1", date: "2026-01-28", productName: "Velvet Noir", orderTotal: 185, commission: 18.5, status: "Paid" },
      { id: "ref-2", date: "2026-01-25", productName: "Oud Imperial", orderTotal: 295, commission: 29.5, status: "Paid" },
      { id: "ref-3", date: "2026-01-20", productName: "Fleur Sauvage", orderTotal: 145, commission: 14.5, status: "Processing" },
      { id: "ref-4", date: "2026-01-15", productName: "Cedre Atlas", orderTotal: 235, commission: 23.5, status: "Processing" },
      { id: "ref-5", date: "2026-01-10", productName: "Nuit Doree", orderTotal: 175, commission: 17.5, status: "Pending" },
      { id: "ref-6", date: "2026-01-05", productName: "Rose Absolue", orderTotal: 210, commission: 21.0, status: "Pending" },
    ],
  },
  {
    id: "aff-2",
    name: "James Chen",
    email: "james@example.com",
    referralCode: "JAMES15",
    joinedDate: "2025-06-01",
    stats: {
      totalClicks: 876,
      conversions: 52,
      earnings: 1680.0,
      conversionRate: 5.9,
    },
    monthlyEarnings: [
      { month: "Aug 2025", earnings: 210 },
      { month: "Sep 2025", earnings: 280 },
      { month: "Oct 2025", earnings: 310 },
      { month: "Nov 2025", earnings: 260 },
      { month: "Dec 2025", earnings: 340 },
      { month: "Jan 2026", earnings: 280 },
    ],
    referralHistory: [
      { id: "ref-7", date: "2026-01-22", productName: "Aqua Minerale", orderTotal: 195, commission: 19.5, status: "Paid" },
      { id: "ref-8", date: "2026-01-18", productName: "Bergamote Soleil", orderTotal: 140, commission: 14.0, status: "Processing" },
      { id: "ref-9", date: "2026-01-12", productName: "Cuir & Tabac", orderTotal: 185, commission: 18.5, status: "Pending" },
    ],
  },
  {
    id: "aff-3",
    name: "Elena Rossi",
    email: "elena@example.com",
    referralCode: "ELENA10",
    joinedDate: "2025-09-10",
    stats: {
      totalClicks: 432,
      conversions: 28,
      earnings: 920.0,
      conversionRate: 6.5,
    },
    monthlyEarnings: [
      { month: "Oct 2025", earnings: 180 },
      { month: "Nov 2025", earnings: 220 },
      { month: "Dec 2025", earnings: 290 },
      { month: "Jan 2026", earnings: 230 },
    ],
    referralHistory: [
      { id: "ref-10", date: "2026-01-20", productName: "Jasmin Nocturne", orderTotal: 155, commission: 15.5, status: "Processing" },
      { id: "ref-11", date: "2026-01-14", productName: "Bois Sacre", orderTotal: 195, commission: 19.5, status: "Pending" },
    ],
  },
]

export function getAffiliateByCode(code: string): Affiliate | undefined {
  return mockAffiliates.find((a) => a.referralCode.toLowerCase() === code.toLowerCase())
}

export function getAffiliateByEmail(email: string): Affiliate | undefined {
  return mockAffiliates.find((a) => a.email === email)
}
