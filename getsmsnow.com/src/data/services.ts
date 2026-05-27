/** Full service list from API: GET /api/smspool/services */
export interface Service {
  id: string;
  name: string;
  icon: string;
  popular: boolean;
  /** Display fallback; real price from GET /api/smspool/price (API cost × 1.7). */
  price: number;
  /** SMSPool service ID for ordering and price. */
  smspoolId: string;
}

const services: Service[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/whatsapp.svg",
    popular: true,
    price: 0.5,
    smspoolId: "1012",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/telegram.svg",
    popular: true,
    price: 0.45,
    smspoolId: "907",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/facebook.svg",
    popular: true,
    price: 0.55,
    smspoolId: "329",
  },
  {
    id: "tinder",
    name: "Tinder",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/tinder.svg",
    popular: true,
    price: 0.6,
    smspoolId: "926",
  },
  {
    id: "google",
    name: "Google",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/google.svg",
    popular: true,
    price: 0.4,
    smspoolId: "395",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/instagram.svg",
    popular: true,
    price: 0.55,
    smspoolId: "457",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/tiktok.svg",
    popular: true,
    price: 0.65,
    smspoolId: "924",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/snapchat.svg",
    popular: true,
    price: 0.6,
    smspoolId: "846",
  },
  {
    id: "uber",
    name: "Uber",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/uber.svg",
    popular: false,
    price: 0.5,
    smspoolId: "951",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/airbnb.svg",
    popular: false,
    price: 0.55,
    smspoolId: "28",
  },
  {
    id: "discord",
    name: "Discord",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/discord.svg",
    popular: false,
    price: 0.45,
    smspoolId: "273",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v8/icons/linkedin.svg",
    popular: false,
    price: 0.5,
    smspoolId: "523",
  },
];

export default services;
