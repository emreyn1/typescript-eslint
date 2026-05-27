import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getsmsnow.com";

const routes: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "sms-activations", changeFrequency: "weekly", priority: 0.9 },
  { path: "rent-number", changeFrequency: "weekly", priority: 0.9 },
  { path: "api", changeFrequency: "monthly", priority: 0.8 },
  { path: "earnings-with-sim-cards", changeFrequency: "monthly", priority: 0.7 },
  { path: "login", changeFrequency: "monthly", priority: 0.6 },
  { path: "registration", changeFrequency: "monthly", priority: 0.6 },
  { path: "forgot-password", changeFrequency: "monthly", priority: 0.5 },
  { path: "faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "referral-program", changeFrequency: "monthly", priority: 0.7 },
  { path: "privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "terms-of-service", changeFrequency: "yearly", priority: 0.4 },
  { path: "refund-policy", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${baseUrl}/${path}` : baseUrl,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
