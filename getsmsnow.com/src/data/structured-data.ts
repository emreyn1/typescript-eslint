/**
 * Structured data (JSON-LD) for SEO — Organization, WebSite, FAQPage.
 * Used in root layout.
 */

export type JsonLd = Record<string, unknown>;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getsmsnow.com";

export function getOrganizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "GetSMSNow",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Get SMS instantly with GetSMSNow! Use secure temporary numbers for quick verification and online privacy.",
    sameAs: ["https://t.me/GetSMSNow"],
  };
}

export function getWebSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GetSMSNow",
    url: siteUrl,
    description: "Receive SMS online with temporary phone numbers. Fast, secure, and reliable.",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/sms-activations?service={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

import { faqItems } from "./faq";

export function getFaqJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getStructuredDataScripts(): JsonLd[] {
  const organization = getOrganizationJsonLd();
  const website = getWebSiteJsonLd();
  const faq = getFaqJsonLd();
  return [organization, website, faq];
}
