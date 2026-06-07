# Maturity Matrix (Güvenilirlik Değerlendirmesi)

Bu setup'taki her bileşenin battle-tested mı yoksa deneysel mi olduğu — risk toleransına
göre seç. (Kaynak: emreyn1 repo, Haziran 2026 itibarıyla.)

| Bileşen | Kaynak | Maturity | Not |
|---------|--------|----------|-----|
| Anthropic Frontend Design | `anthropics/skills` | 🟢 Rock solid | Resmi Anthropic, ~300k kurulum |
| Corey Haines Marketing | `coreyhaines31/marketingskills` | 🟢 Solid | 18.6k ⭐, v2.0 |
| Chrome DevTools MCP | `ChromeDevTools/chrome-devtools-mcp` | 🟢 Rock solid | Google resmi |
| shadcn MCP | `shadcn` | 🟢 Rock solid | Resmi |
| Sequential Thinking MCP | `@modelcontextprotocol` | 🟢 Rock solid | Resmi |
| filesystem MCP | `@modelcontextprotocol` | 🟢 Rock solid | Resmi |
| Hallmark (design review) | `nutlope/hallmark` | 🟡 Stable | 1.8k ⭐, Together AI |
| claude-security-skills | `kalshamsi` | 🟡 Stable | OWASP/SAST |
| Figma MCP | `figma-developer-mcp` | 🟡 Stable | API key gerekir |
| 21st.dev Magic MCP | `@21st-dev/magic` | 🟡 Stable | API key gerekir |
| growth marketing | `ekinciio/saas-growth-marketing-skills` | 🟡 Stable | gaas-growth-hacker yerine free fallback |

## Bu projeye özel not (dev-tool/library)

Senin projen typescript-eslint — bir **geliştirici aracı**, revenue-ürünü değil.
Bu yüzden:
- 🟢 **Yararlı**: frontend-design (website paketi için), güvenlik skill'leri,
  sequential-thinking, filesystem MCP, schema/seo (docs sitesi için)
- 🟡 **Kısmen**: design review (website), copywriting (docs)
- 🔴 **Büyük ihtimalle gereksiz**: paywalls, pricing, cro, signup, ads, churn,
  referrals — bunlar SaaS/e-ticaret içindir. Kurulu ama tetiklenmezler.

Skill'ler lazy-load: sadece trigger eşleştiğinde context'e girer, yani kurulu
olmaları token maliyeti yaratmaz.
