export interface RankConfig {
  id: string
  name: string
  requiredSales: number
  reward: number
}

export const RANKINGS: RankConfig[] = [
  { id: "achiever", name: "Aroma Achiever", requiredSales: 5000, reward: 1000 },
  { id: "builder", name: "Aroma Builder", requiredSales: 25000, reward: 3000 },
  { id: "captain", name: "Aroma Captain", requiredSales: 50000, reward: 5000 },
  { id: "elite", name: "Aroma Elite", requiredSales: 100000, reward: 10000 },
  { id: "executives", name: "Aroma Executives", requiredSales: 300000, reward: 25000 },
  { id: "national_director", name: "Aroma National Director", requiredSales: 500000, reward: 50000 },
  { id: "international_director", name: "Aroma International Director", requiredSales: 1000000, reward: 100000 },
  { id: "global_director", name: "Aroma Global Director", requiredSales: 3000000, reward: 200000 },
]

export function getCurrentRank(totalSales: number): RankConfig | null {
  let current: RankConfig | null = null
  for (const rank of RANKINGS) {
    if (totalSales >= rank.requiredSales) current = rank
  }
  return current
}

export function getNextRank(totalSales: number): RankConfig | null {
  for (const rank of RANKINGS) {
    if (totalSales < rank.requiredSales) return rank
  }
  return null
}
