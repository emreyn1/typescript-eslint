---
inclusion: manual
---

# Keyword → Tool/Skill Triggers (Layer 3 — Manuel/Lazy)

Belirli görevler için eşleşen aracı/skill'i devreye sok. Net kapsamlı tek bir özellik
isteğinde `#00-intent-router` doğrudan buraya yönlendirir.

## Backend / Logic (Sequential Thinking MCP kullan)
| Anahtar kelime | Araç + Skill |
|---------|--------------|
| stripe, subscription, webhook, billing | Sequential Thinking MCP + paywall + pricing |
| auth, magic link, oauth, login, session | Sequential Thinking MCP + signup |
| checkout, cart, payment flow | Sequential Thinking MCP + cro |
| schema design, migration, race condition | Sequential Thinking MCP |

## Conversion / Marketing
| Anahtar kelime | Skill |
|---------|-------|
| landing CRO, homepage, page optimize, form | cro |
| signup, registration, trial activation | signup |
| onboarding, activation, time-to-value | onboarding |
| popup, modal, overlay | popups |
| paywall, upgrade screen, upsell, feature gate | paywalls |
| A/B test, experiment, split test | ab-testing |
| pricing, tier strategy | pricing |
| email, lifecycle, newsletter, sequence | emails |
| referral, viral, share program | referrals |
| copy, headline, microcopy | copywriting |
| mental models, persuasion, urgency | marketing-psychology |

## SEO / Discovery
| Anahtar kelime | Skill |
|---------|-------|
| SEO audit, keywords, rankings | seo-audit |
| AI search, AEO, GEO, LLMO | ai-seo |
| programmatic SEO, scale pages | programmatic-seo |
| structured data, JSON-LD, rich results | schema |
| site structure, nav, internal links | site-architecture |

## UI / Design (MCP'ler)
| Anahtar kelime | Araç |
|---------|------|
| add component, button, card, dialog, table | shadcn MCP |
| Figma URL / design handoff | Figma Context MCP |
| polish, animation, wow effect, hero motion | 21st.dev Magic MCP |
| design review, ship check, a11y audit | design review skill |

## Performance / Data
| Anahtar kelime | Araç |
|---------|------|
| performance, LCP, INP, CLS, slow, lighthouse | Chrome DevTools MCP |
| conversion data, funnel, real metrics, session | PostHog MCP |
| growth, retention, churn, AARRR, PLG | growth-hacker skill |

## Security (fintech/hassas)
| Anahtar kelime | Araç |
|---------|------|
| security audit, PCI, OWASP, threat model, vulnerability | güvenlik skill'leri |

## Dev Tool / Library (bu workspace için)
| Anahtar kelime | Araç |
|---------|------|
| eslint rule, AST, selector | Sequential Thinking MCP + typescript-eslint docs |
| test, vitest, coverage | proje test runner (nx run-many -t test) |
| typecheck, build | nx run-many -t typecheck / build |
