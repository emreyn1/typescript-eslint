# Architecture Decision Records (ADR)

> Bu dosya lazy-load edilir — sadece "decision"/"karar" anahtar kelimesi geçtiğinde
> context'e yüklenir. Mimari kararları gerekçeleriyle birlikte kaydeder.

---

## Decision 1

**Date:** 2026-06-05
**Status:** Accepted

### Context

Kiro IDE workspace'i için MCP + Skills + Steering stack'i kurulması gerekiyordu.
Referans olarak `emreyn1/best-prod-ready-mcp-skills-stack` (Cursor-odaklı) incelendi.
O stack 3-katmanlı bir "Intent Router" mimarisi kullanıyor ve revenue-odaklı
ürünler (fintech/SaaS/streaming) için optimize edilmiş.

### Decision

Reponun 3-katmanlı Intent Router fikri benimsendi ama Kiro'nun steering sistemine
uyarlandı:
- Layer 1 (`00-intent-router`) → `inclusion: always` (her zaman, ~düşük token)
- Layer 2 (`01-project-types`) → `inclusion: manual` (lazy)
- Layer 3 (`02-keyword-triggers`) → `inclusion: manual` (lazy)
- `project-context.md` → `inclusion: always` (bu projeye özel gerçek değerler)

MCP config Cursor formatından (`~/.cursor/mcp.json`) Kiro formatına
(`.kiro/settings/mcp.json`) çevrildi.

### Consequences

- Olumlu: Token verimli (her mesajda sadece 2 always-on dosya yüklenir)
- Olumlu: Bu dev-tool/library projesine özel project-type eklendi
- Olumlu: Güvenli MCP'ler (filesystem read-only, git read-only) auto-approve
- Negatif: Cursor'a özgü skill'ler (Corey Haines, UI/UX Pro Max) doğrudan
  taşınamadı — bunlar `npx skills add` ile ayrıca kurulmalı

### Alternatives

- Single-file rule (her şey tek dosyada): reddedildi, ~2400 token/mesaj çok pahalı
- Reponun olduğu gibi kopyalanması: reddedildi, bu proje revenue-ürünü değil dev-tool
