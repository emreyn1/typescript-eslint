q# `captures/prn` — Teknik Özet (utanmazturkler / VOE akışı)

Dosya formatı: HTTP Toolkit benzeri **binary capture** (metin değil). İçerik `strings` ve grep ile okunabilir.

---

## 1. Video gerçekten “sitede” mi duruyor?

**Hayır — ham video dosyası `utanmazturkler.com` sunucusunda barındırılmıyor gibi görünüyor.**

Yakalamada geçen başlık ve parametreler şunu söylüyor:

- Oynatıcı metni: `Watch tirrekdemir3-utanmazturkler.com.mp4 - VOE | Content Delivery Network (CDN) & Video Cloud`
- Yani **dosya adı / başlık** olarak `…utanmazturkler.com.mp4` kullanılıyor; bu **markalama veya kaynak etiketi**, “video bu domainin diskinde” anlamına gelmeyebilir.

Gerçek medya teslimatı **üçüncü taraf embed/CDN** üzerinden.

---

## 2. Kim depoluyor / servis ediyor?

### VOE (Video embed sağlayıcısı)

- JW Player telemetri isteklerinde açıkça **VOE** ve **CDN & Video Cloud** geçiyor.
- Sayfa/embed adresi örnek olarak: `https://jefferycontrolmodel.com/e/rjhp5tnotawr` (yakalamada geçen host).

### `jefferycontrolmodel.com` — ön yüz / ayna domain

- **Sunucu başlığı:** `ddos-guard`
- **Çerezler:** `__ddg8_`, `__ddg10_`, `__ddg9_` → tipik **DDoS-Guard** ön katmanı.
- Bu tür domainler sık sık **rotasyonlu / gizlenmiş** embed sayfası için kullanılır; asıl iş VOE tarafında.

### Asıl video: HLS + imzalı URL

Yakalamada geçen **medya kökü** (özet):

```
https://cdn-<random>.edgeon-bandwidth.com/engine/hls2-c/01/<id>/<streamId>_,n,.urlset/master.m3u8?t=<token>&s=<start>&e=<ttl>&f=<file>&node=<...>&i=<ip-prefix>&sp=<speed>&asn=<asn>&q=...&rq=...
```

- **Protokol:** HLS (`master.m3u8`, `hls2-c` yolu).
- **Host:** `*.edgeon-bandwidth.com` — embed sağlayıcının **edge CDN** alan adı kalıbı.
- **Sorgu parametreleri:** Zaman damgası, TTL (`e=14400` gibi), dosya kimliği, düğüm imzası, IP/ASN ile **kısıtlı, süreli** erişim tipik **signed URL** modeli.

**Sonuç:** Depolama büyük ihtimalle VOE’nin (veya onun arkasındaki) **nesne depolama + edge cache** katmanında; site sadece **embed sayfası + metadata** sunuyor.

---

## 3. Diğer görünen parçalar

| Bileşen | Rol |
|--------|-----|
| **JW Player** | Oynatıcı; telemetri `.gif?...` ile (beacon) — içerik türü “image” gibi görünür, aslında analytics. |
| **Laravel tarzı oturum** | `XSRF-TOKEN`, `voe_session` — sunucu tarafı oturum. |
| **Reklam / senk** | `coosync.com`, `cactusheadroomscaling.com`, `darnobedienceupscale.com` — üçüncü taraf script/ads. |
| **Tarayıcı / Google** | `gstatic`, `googleapis`, güncelleme/CSP — videoyla doğrudan ilgili değil. |

`pncloudfl.com`, `cloudfront.net` gibi dizeler de çıkıyor; bunlar ek CDN veya başka isteklerden olabilir — ana HLS hattı burada **`edgeon-bandwidth.com` + imzalı m3u8**.

---

## 4. Mimari şema (özet)

```
Kullanıcı → utanmazturkler (liste / sayfa)
       → iframe veya yönlendirme
       → DDoS-Guard arkasındaki embed domain (ör. jefferycontrolmodel.com)
       → VOE altyapısı
       → edgeon-bandwidth.com üzerinden HLS (master.m3u8 + segmentler)
```

**Site operatörü** için “depolama” çoğu zaman:

- kendi sunucusunda **thumbnail, başlık, embed linki, belki cache**;
- **asıl video** VOE/CDN üzerinde, **token süresi dolunca** link ölür.

---

## 5. Senin projeyle karşılaştırma

| Konu | Bu capture | Option 9 / embed-api |
|------|------------|----------------------|
| Medya | Üçüncü taraf embed (VOE) | Kendi pipeline veya torrent+RD |
| Teslimat | HLS + signed m3u8 | HLS + R2 / imza |
| Ön yüz | DDoS-Guard + rastgele domain | Cloudflare / kendi domain |

---

*Not: Bu dosya yalnızca trafik analizi içindir; içeriğin yasallığı veya telif durumu değerlendirilmemiştir.*
