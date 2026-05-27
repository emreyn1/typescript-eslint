export interface Period {
  id: string;
  name: string;
  duration: string;
  durationInMinutes: number;
  isActivation: boolean;
  priceMultiplier: number;
}

const periods: Period[] = [
  {
    id: "10min",
    name: "10 Minutes",
    duration: "10 minutes",
    durationInMinutes: 10,
    isActivation: true,
    priceMultiplier: 1
  },
  {
    id: "1hour",
    name: "1 Hour",
    duration: "1 hour",
    durationInMinutes: 60,
    isActivation: false,
    priceMultiplier: 2.5
  },
  {
    id: "3hours",
    name: "3 Hours",
    duration: "3 hours",
    durationInMinutes: 180,
    isActivation: false,
    priceMultiplier: 5
  },
  {
    id: "1day",
    name: "1 Day",
    duration: "24 hours",
    durationInMinutes: 1440,
    isActivation: false,
    priceMultiplier: 10
  },
  {
    id: "3days",
    name: "3 Days",
    duration: "3 days",
    durationInMinutes: 4320,
    isActivation: false,
    priceMultiplier: 25
  },
  {
    id: "1week",
    name: "1 Week",
    duration: "7 days",
    durationInMinutes: 10080,
    isActivation: false,
    priceMultiplier: 50
  },
  {
    id: "1month",
    name: "1 Month",
    duration: "30 days",
    durationInMinutes: 43200,
    isActivation: false,
    priceMultiplier: 180
  }
];

export default periods;
