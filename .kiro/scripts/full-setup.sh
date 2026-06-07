#!/usr/bin/env bash
# Kiro MCP + Skills + Steering tek-seferlik kurulum (idempotent).
# emreyn1/best-prod-ready-mcp-skills-stack reposundan Kiro'ya uyarlandı.
# Kullanım: bash .kiro/scripts/full-setup.sh
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}==>${NC} $*"; }
warn() { echo -e "${YELLOW}!!>${NC} $*"; }
err()  { echo -e "${RED}ERROR:${NC} $*" >&2; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || { err "Eksik komut: $1"; exit 1; }; }

# --- Preflight ---
log "Preflight kontrolleri"
need_cmd node
need_cmd npx
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
[[ "$NODE_MAJOR" -ge 18 ]] || { err "Node.js 18+ gerekli (bulunan v$(node -v))"; exit 1; }

# --- Skill kurulumu (free-first, hata toleranslı) ---
install_skill() {
  local label="$1"; shift
  log "Skill kuruluyor: $label"
  if "$@" >/dev/null 2>&1; then log "  OK: $label"; else warn "  BAŞARISIZ (kritik değil): $label — sonra manuel kur."; fi
}

install_skill "Anthropic Frontend Design" \
  npx --yes skills add https://github.com/anthropics/skills --skill frontend-design -y
install_skill "Hallmark (design review)" \
  npx --yes skills add nutlope/hallmark -y
install_skill "Corey Haines Marketing v2.0" \
  npx --yes skills add coreyhaines31/marketingskills -y
install_skill "Security Skills" \
  npx --yes skills add kalshamsi/claude-security-skills -y
install_skill "Growth Marketing (free fallback)" \
  npx --yes skills add ekinciio/saas-growth-marketing-skills -y

# --- Doğrulama ---
log "Doğrulama"
echo ""
echo "Steering rules (.kiro/steering):"
ls -1 .kiro/steering/ 2>/dev/null | sed 's/^/  /' || warn "  Bulunamadı"
echo ""
echo "MCP servers (.kiro/settings/mcp.json):"
node -e "const d=require('./.kiro/settings/mcp.json'); Object.keys(d.mcpServers).forEach(k=>console.log('  - '+k+(d.mcpServers[k].disabled?' (kapalı)':'')))" 2>/dev/null || warn "  mcp.json okunamadı"
echo ""
SKILL_COUNT="$(ls -1 .agents/skills/ 2>/dev/null | wc -l | tr -d ' ')"
echo "Skills: $SKILL_COUNT kurulu (.agents/skills, Kiro'ya symlink)"
echo ""
echo "=============================================="
log "Kurulum tamamlandı."
echo "=============================================="
echo ""
echo "ŞİMDİ YAPMAN GEREKEN:"
echo "  1. Kiro'yu tamamen kapat (Cmd+Q) ve tekrar aç."
echo "  2. MCP serverların bağlandığını doğrula."
echo "  3. .kiro/docs/03-testing.md testlerini yeni sohbette çalıştır."
echo ""
echo "OPSİYONEL:"
echo "  git/fetch MCP için: brew install uv  →  mcp.json'da disabled:false yap"
echo "  UI/UX Pro Max için: npm i -g uipro-cli && uipro init --ai kiro --global"
