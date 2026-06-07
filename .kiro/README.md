# .kiro/ Workspace Configuration

Bu dizin Kiro IDE'nin workspace yapılandırmasını içerir. `emreyn1/best-prod-ready-mcp-skills-stack`
stack'inden uyarlanmış, bu dev-tool/library projesine özelleştirilmiş bir kurulumdur.

## Dizin Yapısı

```
.kiro/
├── README.md              # Bu dosya
├── decisions.md           # Architecture Decision Records (lazy-load)
├── settings/
│   └── mcp.json           # MCP server yapılandırması
├── steering/              # Steering rules (Kiro davranış kuralları)
│   ├── project-context.md      # [always] Bu projeye özel context
│   ├── 00-intent-router.md     # [always] Layer 1: vague istek dedektörü
│   ├── 01-project-types.md     # [manual] Layer 2: proje tipi decomposition
│   └── 02-keyword-triggers.md  # [manual] Layer 3: keyword→araç eşleme
└── specs/                 # Spec dokümanları (requirements/design/tasks)
    └── kiro-workspace-config/
```

## 3-Katmanlı Intent Router Nasıl Çalışır

```
Kullanıcı isteği
    │
    ▼
Layer 1 (her zaman açık) — Bu istek belirsiz mi? ("en iyi yap", "geliştir")
    │ belirsiz                    │ net
    ▼                             ▼
Layer 2 (#01 ile yükle)    Layer 3 (#02 ile yükle)
proje tipini tespit et,    keyword → kesin araç/skill
ilgili konuları dahil et
```

Layer 2 ve 3 sadece gerektiğinde context'e girer → always-on footprint küçük kalır.

## Steering Rules Inclusion Tipleri

- **always**: Her sohbette otomatik yüklenir (`project-context.md`, `00-intent-router.md`)
- **manual**: `#kural-adı` ile manuel çağrılır (`01-project-types`, `02-keyword-triggers`)
- **file-match**: Belirli dosya pattern'leri açıldığında yüklenir (henüz yok)

## MCP Servers

Aktif (auto-approve ile güvenli okuma işlemleri):
- **sequential-thinking**: Adım adım backend/mantık akıl yürütme
- **filesystem**: Dosya okuma (read-only auto-approve)

Devre dışı (gerekirse `disabled: false` yap):
- **git**: Git durumu/diff — `uv` gerektirir (`brew install uv`)
- **fetch**: Web içeriği çekme — `uv` gerektirir (`brew install uv`)
- **chrome-devtools**: Performans (LCP/INP/CLS) ölçümü
- **shadcn**: UI component kurulumu

> Not: `sequential-thinking`, `filesystem`, `chrome-devtools`, `shadcn` Node.js v20+
> ile çalışır (kurulu ✓). `git` ve `fetch` için `uv`/`uvx` gerekir:
> `brew install uv` ardından `mcp.json`'da `disabled: false` yap.

## Yeni Skill Ekleme

Skill'ler açık standarttır. Kiro'ya kurmak için:
```bash
npx skills add <github-repo> -g        # global (~/.kiro/skills/)
npx skills add <github-repo>           # workspace (.kiro/skills/)
```

Örnek (Anthropic frontend design):
```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design -g
```

## Güvenlik

- `mcp.json` içinde gerçek API anahtarı SAKLAMA — `.gitignore`'a ekle
- Sadece read-only işlemler auto-approve edildi (write/delete onay ister)
