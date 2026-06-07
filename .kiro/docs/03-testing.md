# Intent Router Testi

Stack'e güvenmeden önce rules'ın gerçekten devreye girdiğini doğrula. ~15 dakika.

> Bu testler *routing davranışını* doğrular (agent plan yapıyor mu, tip tespit ediyor mu,
> araç seçiyor mu?). Skill/MCP'lerin kurulu olmasını gerektirmez — rules onlara referans
> verir ama routing bağımsız çalışır.

## Hazırlık
1. Steering rules kurulu olmalı (kurulu ✓).
2. Kiro'yu tamamen yeniden başlat (Cmd+Q). Rules aksi halde yeniden yüklenmez.
3. Her test için yeni sohbet aç (context taşınmasını önle).

## Test Senaryoları

### Test 1 — Belirsiz, fintech
Prompt: `en iyi kart sitesini yap`
Geçme kriteri:
- [ ] Hemen kod yazmaya başlamıyor
- [ ] Fintech tipi çıkarsıyor
- [ ] ≤3 netleştirici soru soruyor
- [ ] Fintech konularını gündeme getiriyor (PCI, idempotent webhook, paywall, 2FA)
- [ ] Onay bekliyor

### Test 2 — Belirsiz, dev-tool (bu proje)
Prompt: `bu eslint plugin'i geliştir`
Geçme kriteri:
- [ ] dev-tool/library tipini tespit ediyor
- [ ] Semver, test, public API koruması konularını vurguluyor
- [ ] Önce soruyor

### Test 3 — Çok belirsiz
Prompt: `kodumu iyileştir`
Geçme kriteri:
- [ ] Hangi dosya/proje ve hangi açıdan diye soruyor
- [ ] Körlemesine refactor başlatmıyor

### Test 4 — Net görev (Layer 3)
Prompt: `packages/eslint-plugin'e yeni bir lint rule ekle: no-foo`
Geçme kriteri:
- [ ] Vague soruları atlıyor (kapsam net)
- [ ] Sequential Thinking + test yazımı vurguluyor

## Skorlama
- 4-5/5 geçti → Router çalışıyor.
- 2-3/5 → Rule gövdesini iyileştir, başarısız vaka için örnek ekle.
- 0-1/5 → Setup sorunu (Kiro yeniden başlatıldı mı?).

## Model Notu
Rules Kiro tarafından enjekte edilir; ne kadar *iyi takip edildiği* modele bağlıdır.
Claude-sınıfı modeller (Opus/Sonnet) çok adımlı rules'ı güvenilir takip eder.
Küçük modeller uzun rules'ta sapabilir — bu yüzden modular setup (küçük always-on
ayak izi) daha sağlam.
