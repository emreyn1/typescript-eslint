# Kurulum (Kiro'ya Uyarlanmış)

Bu setup `emreyn1/best-prod-ready-mcp-skills-stack` reposundan Kiro IDE'ye uyarlandı.
Tüm komutlar bu workspace'te doğrulandı (Haziran 2026).

Önkoşullar: Node.js v20+ (kurulu ✓), npm/npx, Kiro IDE. Opsiyonel: `uv` (git/fetch MCP için).

---

## Tek seferde kurulum

```bash
bash .kiro/scripts/full-setup.sh
```

Modular steering rules + MCP config + temel skill'leri kurar. Sonra Kiro'yu yeniden başlat.

---

## Adım adım

### 1. Steering Rules (kurulu ✓)
`.kiro/steering/` altında:
- `00-intent-router.md` [always] — Layer 1
- `01-project-types.md` [manual] — Layer 2
- `02-keyword-triggers.md` [manual] — Layer 3
- `project-context.md` [always] — bu projeye özel

### 2. Skills (kurulu ✓ — 72 skill)
```bash
# Design
npx skills add https://github.com/anthropics/skills --skill frontend-design -y
npx skills add nutlope/hallmark -y          # design review

# Marketing / CRO (Corey Haines v2.0)
npx skills add coreyhaines31/marketingskills -y

# Güvenlik
npx skills add kalshamsi/claude-security-skills -y

# Growth
npx skills add ekinciio/saas-growth-marketing-skills -y
```
Skill'ler `.agents/skills/`'e kurulur, `.kiro/skills/`'e symlink'lenir.

### 3. UI/UX Pro Max (opsiyonel — ayrı CLI)
```bash
npm install -g uipro-cli
uipro init --ai kiro --global
```

### 4. MCP Servers (kurulu ✓)
`.kiro/settings/mcp.json` — aktif: sequential-thinking, filesystem.
Kapalı (gerekirse aç): git, fetch (uv gerekir), chrome-devtools, shadcn.

### 5. Kiro'yu yeniden başlat
Rules ve MCP'ler başlangıçta yüklenir. Cmd+Q, tekrar aç.

### 6. Doğrula
`.kiro/docs/03-testing.md` içindeki senaryoları yeni bir sohbette çalıştır.
