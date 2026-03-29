const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);

async function main() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox'
        ]
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Network logları
    page.on('request', req => {
        if (req.url().includes('.m3u8') || req.url().includes('/api/v1/l') || req.url().includes('/player')) {
            console.log("🔥 KRİTİK İSTEK:", req.url());
        }
    });

    console.log("Cloudflare korumalı sayfaya gidiliyor...");

    await page.goto('https://primesrc.me/embed/tv?tmdb=249597&season=1&episode=1', {
        waitUntil: 'domcontentloaded',
        timeout: 90000
    });

    console.log("Sayfa yüklendi. Cloudflare challenge'ı geçmesini bekliyoruz...");

    await page.waitForTimeout(15000); // Cloudflare'ın challenge'ı çözmesi için süre ver

    console.log("15 saniye beklendi. Player'ı manuel başlatabilirsin.");

    // Tarayıcıyı açık bırak
}

main().catch(err => console.error("Hata:", err));
