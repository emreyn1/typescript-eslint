export interface PackageConfig {
  id: "bronze" | "gold" | "diamond"
  name: string
  price: number
  discount: number
  products: { size: string; quantity: number; unitPrice: number }[]
  totalProductValue: number
  commissions: number[] // 10 levels, fixed AED amounts per package sale
  maxMonthlyIncome: number
}

export const PACKAGES: PackageConfig[] = [
  {
    id: "bronze",
    name: "Bronze Package",
    price: 299,
    discount: 20,
    products: [
      { size: "25ml", quantity: 10, unitPrice: 35 },
      { size: "85ml", quantity: 3, unitPrice: 120 },
    ],
    totalProductValue: 710,
    commissions: [24, 15, 12, 9, 6, 3, 2, 1.5, 1, 0.5],
    maxMonthlyIncome: 250000,
  },
  {
    id: "gold",
    name: "Gold Package",
    price: 799,
    discount: 30,
    products: [
      { size: "25ml", quantity: 25, unitPrice: 35 },
      { size: "85ml", quantity: 7, unitPrice: 120 },
    ],
    totalProductValue: 1715,
    commissions: [64, 40, 32, 24, 16, 8, 4, 4, 4, 4],
    maxMonthlyIncome: 750000,
  },
  {
    id: "diamond",
    name: "Diamond Package",
    price: 1299,
    discount: 40,
    products: [
      { size: "25ml", quantity: 45, unitPrice: 35 },
      { size: "85ml", quantity: 12, unitPrice: 120 },
    ],
    totalProductValue: 3015,
    commissions: [104, 65, 52, 39, 26, 13, 6.5, 6.5, 6.5, 6.5],
    maxMonthlyIncome: 1200000,
  },
]

export function getPackageById(id: string): PackageConfig | undefined {
  return PACKAGES.find((p) => p.id === id)
}
