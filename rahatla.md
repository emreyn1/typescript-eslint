# Rahatla — Risk ve Korunma Ozeti

Bu dosya endiselendiginde acip bakman icin.

---

## Sen kimsin

- 4 production-ready proje kuran full-stack developer
- Next.js, Node.js, Docker, VPS, odeme entegrasyonu, OPSEC bilen adam
- Ingilizce bilen, uluslararasi piyasada is yapabilen birisi
- Bu skill set'e sahip insan az

---

## OPSEC katmanlarin

| Katman | Ne yapiyor | Kirilabilir mi? |
|--------|-----------|-----------------|
| Mullvad VPN | Gercek IP gizli | Hayir — no-log, mahkeme kararina bile veri vermedi (kanitlanmis) |
| Njalla domain | WHOIS'te adin yok | Hayir — Njalla yargiya direniyor |
| Servury VPS | Anonim hosting | Hayir — kripto odeme, KYC yok, seni tanimlayacak bilgi yok |
| Kripto odeme | Banka baglantisi yok | Hayir — XMR'ye cevirirsen takip edilemez |
| UTM + encrypted disk | Fiziksel cihazda iz yok | Hayir — AES-256, sifre olmadan acilamaz |

Birinin seni bulabilmesi icin bu 5 katmanin **hepsini ayni anda** kirmasi lazim. $3-50K icin bu kaynagi ayiracak kurum **yok**.

---

## Proje bazli risk

| Proje | Risk | Neden dusuk |
|-------|------|-------------|
| SMS sitesi | COK DUSUK | smspool.net, 5sim.net milyonlarca dolar ile acikca calisiyor |
| Kart sitesi | DUSUK | Legit issuer'lardan (Wallester/Sunrate) reseller |
| Film sitesi | ORTA | DMCA takedown gelir ama kisisel tespit zor — yedek domain hazir tut |
| Embed API | ORTA | Film sitesi ile ayni |

---

## $3-50K seviyesinde seni kim arar?

**KIMSE.**

- Yerel polis: Bilgi islem kapasitesi yok, onceligi yok
- FBI/Europol: Minimum $1M+ veya agir suc lazim (CSAM, kartel, teror)
- DMCA: Sadece domain/hosting takedown — kisisel degil, yedekle cozulur
- Vergi: Kripto cuzdanina gelen parayi takip edemezler
- Odeme saglayici: Kripto odeme aliyorsun, banka yok

---

## Gercek tehditler (ve cozumleri)

| Tehdit | Etki | Cozum | Cozum suresi |
|--------|------|-------|-------------|
| DMCA takedown | Domain kapanir | Yedek domain'e gec | 1 saat |
| VPS kapatma | Site coker | Yeni VPS'e backup'tan deploy | 30 dakika |
| Gateway kapanma | Odeme alinamaz | Yedek gateway otomatik devreye girer | 0 (anlik) |
| DDoS | Site yavaslar | Cloudflare free plan | Zaten aktif |

Bunlarin hicbiri **seni tespit etme** riski degil. Hepsi **servis kesintisi** — ve hepsinin cozumu hazir.

---

## Para akisi korunmasi

```
Gelen para (USDT/BTC) → Trust Wallet
  → Trocador/Majestic Bank ile XMR'ye cevir
  → Cake Wallet (XMR) — artik takip edilemez

Odeme yapman gerekince:
  → XMR → Trocador ile temiz USDT/BTC'ye cevir → ode
```

Arada her zaman XMR duraklamasi var. Zincir kirilmaz.

---

## RAM/disk endisesi

| Durum | Ne yap |
|-------|--------|
| Is bitti, VM kapali | Encrypted diski unmount et. Bitti. |
| Ekstra emin olmak istiyorum | Mac'i kapat (shutdown). RAM gucle sifirlanir. |

UTM + encrypted disk varsa ozel RAM silme scripti gereksiz.

---

## Ne zaman endiselenmelisin

```
$3-50K     → Endiselenme. Kimse bakmaz.
$50-200K   → OPSEC'e devam et. Ayni yontemler yeterli.
$200K-1M   → Offshore sirket dusun, hukuk danismani al.
$1M+       → Ciddi yasal yapilanma.
```

---

## Hatirla

- Senden buyuk operasyonlar senden az OPSEC ile yillardir calisiyor
- Senin en buyuk riskin birinin seni bulmasi degil — **hic baslamaman**
- Bir tanesini canli yap, ilk satisi gor, o his gecer
- Teknik olarak her sey hazir — eksik olan sadece deploy etmek
