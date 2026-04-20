import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

const landingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>MovieOn API</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a0a;--surface:#111;--border:#222;--text:#e5e5e5;--muted:#888;--accent:#818cf8;--green:#22c55e}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.container{max-width:720px;width:100%}
h1{font-size:32px;font-weight:700;margin-bottom:4px}
.badge{display:inline-block;background:var(--green);color:#000;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;margin-left:8px;vertical-align:middle}
.subtitle{color:var(--muted);font-size:14px;margin-bottom:32px;line-height:1.6}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:16px}
.card h2{font-size:15px;font-weight:600;margin-bottom:16px;color:var(--accent);text-transform:uppercase;letter-spacing:1px}
.endpoint{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px}
.method{background:var(--accent);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;min-width:36px;text-align:center}
.path{color:var(--text);font-family:'SF Mono',Monaco,monospace;font-size:13px}
.desc{color:var(--muted);font-size:12px;margin-left:52px;margin-bottom:14px}
.section-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin:20px 0 12px;padding-top:16px;border-top:1px solid var(--border)}
.example{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:'SF Mono',Monaco,monospace;font-size:12px;color:var(--muted);overflow-x:auto;margin-top:16px;line-height:1.6}
.example span{color:var(--accent)}
.example .comment{color:#555}
.stats{display:flex;gap:20px;margin-top:24px;justify-content:center}
.stat{text-align:center;padding:12px 20px;background:var(--surface);border:1px solid var(--border);border-radius:8px;min-width:100px}
.stat-val{font-size:28px;font-weight:700;color:var(--accent)}
.stat-label{font-size:11px;color:var(--muted);margin-top:4px}
footer{text-align:center;margin-top:28px;color:#444;font-size:11px}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.note{background:#1a1a0a;border:1px solid #333300;border-radius:8px;padding:12px 16px;font-size:12px;color:#cca;margin-top:16px}
</style>
</head>
<body>
<div class="container">
  <h1>MovieOn<span class="badge">FREE API</span></h1>
  <p class="subtitle">
    Free movie &amp; TV show streaming API. No API key required.<br>
    Embed our player or fetch sources directly. 10+ providers, auto quality, multi-server fallback.
  </p>

  <div class="card">
    <h2>Embed Player</h2>
    <p style="font-size:12px;color:var(--muted);margin-bottom:16px">Drop an iframe into your site. Player handles source selection, quality, and fallback automatically.</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/watch/movie/:tmdb_id</span>
    </div>
    <p class="desc">Full player with multi-source, quality selector, keyboard shortcuts</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/watch/tv/:tmdb_id/:season/:episode</span>
    </div>
    <p class="desc">TV episode player with same features</p>

    <div class="example">
      <span class="comment">&lt;!-- Embed a movie (e.g. Fight Club) --&gt;</span><br>
      &lt;iframe src="<span>https://${config.embedDomain}/watch/movie/550</span>"<br>
      &nbsp;&nbsp;width="100%" height="100%" frameborder="0"<br>
      &nbsp;&nbsp;allowfullscreen&gt;&lt;/iframe&gt;<br><br>
      <span class="comment">&lt;!-- Embed a TV episode (Breaking Bad S01E01) --&gt;</span><br>
      &lt;iframe src="<span>https://${config.embedDomain}/watch/tv/1396/1/1</span>"<br>
      &nbsp;&nbsp;width="100%" height="100%" frameborder="0"<br>
      &nbsp;&nbsp;allowfullscreen&gt;&lt;/iframe&gt;
    </div>
  </div>

  <div class="card">
    <h2>JSON API</h2>
    <p style="font-size:12px;color:var(--muted);margin-bottom:16px">Fetch raw sources for custom player integration.</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/v1/cinepro/sources?tmdb=:id</span>
    </div>
    <p class="desc">Returns all sources with quality, type (HLS/MP4), and provider info</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/v1/cinepro/sources?tmdb=:id&amp;type=tv&amp;s=1&amp;e=1</span>
    </div>
    <p class="desc">TV episode sources</p>

    <div class="section-label">Legacy Endpoints</div>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/v1/sources?tmdb=:id</span>
    </div>
    <p class="desc">Iframe-based source list (5 providers)</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/v1/health</span>
    </div>
    <p class="desc">Health check</p>

    <div class="example">
      <span class="comment">// Example: Fetch sources for Inception</span><br>
      fetch('<span>https://${config.embedDomain}/api/v1/cinepro/sources?tmdb=27205</span>')<br>
      &nbsp;&nbsp;.then(r =&gt; r.json())<br>
      &nbsp;&nbsp;.then(data =&gt; {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;console.log(data.total + ' sources found');<br>
      &nbsp;&nbsp;&nbsp;&nbsp;console.log('Best:', data.best);<br>
      &nbsp;&nbsp;});
    </div>
  </div>

  <div class="card">
    <h2>Features</h2>
    <ul style="list-style:none;font-size:13px;line-height:2.2">
      <li>&#x2714;&nbsp; <strong>10+ providers</strong> with automatic fallback</li>
      <li>&#x2714;&nbsp; <strong>Auto quality</strong> — up to 4K, adaptive bitrate</li>
      <li>&#x2714;&nbsp; <strong>No API key</strong> required</li>
      <li>&#x2714;&nbsp; <strong>HLS + MP4</strong> direct stream URLs</li>
      <li>&#x2714;&nbsp; <strong>Subtitles</strong> when available</li>
      <li>&#x2714;&nbsp; <strong>Mobile responsive</strong> player</li>
      <li>&#x2714;&nbsp; <strong>Keyboard shortcuts</strong> (space, arrows, F, M)</li>
      <li>&#x2714;&nbsp; <strong>PiP &amp; Fullscreen</strong></li>
      <li>&#x2714;&nbsp; <strong>CORS enabled</strong> — use from any domain</li>
      <li>&#x2714;&nbsp; <strong>Rate limit:</strong> 120 req/min per IP</li>
    </ul>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-val">10+</div><div class="stat-label">Providers</div></div>
    <div class="stat"><div class="stat-val">100K+</div><div class="stat-label">Movies</div></div>
    <div class="stat"><div class="stat-val">50K+</div><div class="stat-label">TV Shows</div></div>
    <div class="stat"><div class="stat-val">4K</div><div class="stat-label">Max Quality</div></div>
  </div>

  <div class="note">
    <strong>Rate limiting:</strong> 120 requests per minute per IP.
    Abusive usage will result in temporary bans.
    For high-volume usage, contact us.
  </div>

  <footer>&copy; 2026 MovieOn &middot; Powered by TMDB &middot; <a href="https://${config.siteDomain}">Visit movieon.to</a></footer>
</div>
</body>
</html>`;

export async function siteRoutes(app: FastifyInstance) {
  app.get("/", async (_req, reply) => {
    return reply
      .header("Content-Type", "text/html; charset=utf-8")
      .send(landingHtml);
  });
}
