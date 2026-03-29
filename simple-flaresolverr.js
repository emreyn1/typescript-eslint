const { chromium } = require('playwright');

async function main() {
    console.log("🚀 Basit FlareSolverr Testi Başlatılıyor...");

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("Siteye gidiliyor...");

    try {
        await page.goto('https://primesrc.me/embed/tv?tmdb=249597&season=1&episode=1', {
            waitUntil: 'domcontentloaded',
            timeout: 90000
        });

        console.log("✅ Sayfa açıldı! Cloudflare geçti mi?");
        await page.waitForTimeout(10000);

    } catch (e) {
        console.error("Hata:", e.message);
    }
}

main();
