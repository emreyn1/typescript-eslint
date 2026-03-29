const { chromium } = require('playwright');

async function main() {
    console.log("🚀 FlareSolverr + Playwright (Sistem Proxy) başlatılıyor...");

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
        proxy: {
            server: 'http://127.0.0.1:8191'
        }
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });

    const page = await context.newPage();

    // Kritik istekleri logla
    page.on('request', request => {
        const url = request.url();
        if (url.includes('.m3u8') || url.includes('/api/v1/l') || url.includes('/player')) {
            console.log("🔥 KRİTİK İSTEK:", url);
        }
    });

    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/v1/l') || url.includes('/player')) {
            console.log("📥 RESPONSE:", response.status(), url);
        }
    });

    console.log("🌐 Siteye gidiliyor...");

    try {
        await page.goto('https://primesrc.me/embed/tv?tmdb=249597&season=1&episode=1', {
            waitUntil: 'domcontentloaded',
            timeout: 120000
        });

        console.log("✅ Sayfa yüklendi. FlareSolverr challenge'ı çözmeye çalışıyor...");

        await page.waitForTimeout(20000); // 20 saniye bekle

        console.log("20 saniye beklendi. Player'ı manuel olarak başlat.");

    } catch (error) {
        console.error("Hata:", error.message);
    }
}

main().catch(err => console.error("Genel hata:", err));
