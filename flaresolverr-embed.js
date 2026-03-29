const { chromium } = require('playwright');

async function main() {
    console.log("🚀 FlareSolverr ile bağlanılıyor...");

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        proxy: {
            server: 'http://127.0.0.1:8191'
        }
    });

    const page = await context.newPage();

    page.on('request', request => {
        const url = request.url();
        if (url.includes('.m3u8') || url.includes('/api/v1/l') || url.includes('/player')) {
            console.log("🔥 KRİTİK İSTEK:", url);
        }
    });

    console.log("Sayfa açılıyor...");

    try {
        await page.goto('https://primesrc.me/embed/tv?tmdb=249597&season=1&episode=1', {
            waitUntil: 'domcontentloaded',
            timeout: 90000
        });

        console.log("✅ Sayfa yüklendi. Cloudflare çözülüyor...");

        await page.waitForTimeout(15000); // Challenge için süre ver

        console.log("15 saniye beklendi. Player'ı manuel başlatabilirsin.");
    } catch (error) {
        console.error("Sayfa açılırken hata:", error.message);
    }
}

main().catch(err => console.error("Genel hata:", err));
