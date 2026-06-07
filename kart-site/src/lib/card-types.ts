export const CARD_VARIANTS = {
  NEXUS_3D: {
    id: 'NEXUS_3D',
    name: 'Nexus 3D',
    description: 'Perfect for everyday online purchases',
    price: 15,
    monthlyFee: 0,
    limits: {
      daily: 5000,
      monthly: 25000,
      perTransaction: 2500,
    },
    features: [
      '3D Secure enabled',
      'Instant virtual card',
      'Works worldwide',
      'No monthly fee',
    ],
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
  },
  OMNI_LITE: {
    id: 'OMNI_LITE',
    name: 'OMNI Lite',
    description: 'Higher limits for power users',
    price: 25,
    monthlyFee: 2,
    limits: {
      daily: 10000,
      monthly: 50000,
      perTransaction: 5000,
    },
    features: [
      '3D Secure enabled',
      'Instant virtual card',
      'Higher daily limits',
      'Priority support',
    ],
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
  },
  OMNI_PRO: {
    id: 'OMNI_PRO',
    name: 'OMNI Pro',
    description: 'Maximum limits for professionals',
    price: 50,
    monthlyFee: 5,
    limits: {
      daily: 25000,
      monthly: 100000,
      perTransaction: 10000,
    },
    features: [
      '3D Secure enabled',
      'Instant virtual card',
      'Maximum limits',
      'VIP support',
      'Cashback rewards',
    ],
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
  },
} as const;

export type CardVariantId = keyof typeof CARD_VARIANTS;

export function getCardVariant(id: string) {
  return CARD_VARIANTS[id as CardVariantId] || CARD_VARIANTS.NEXUS_3D;
}
