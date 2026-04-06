import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

const landingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Embed API</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a0a;--surface:#111;--border:#222;--text:#e5e5e5;--muted:#888;--accent:#6366f1}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.container{max-width:640px;width:100%}
h1{font-size:28px;font-weight:700;margin-bottom:8px}
.subtitle{color:var(--muted);font-size:14px;margin-bottom:32px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:16px}
.card h2{font-size:16px;font-weight:600;margin-bottom:12px;color:var(--accent)}
.endpoint{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px}
.method{background:var(--accent);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;min-width:36px;text-align:center}
.path{color:var(--text);font-family:monospace;font-size:13px}
.desc{color:var(--muted);font-size:12px;margin-left:52px;margin-bottom:12px}
.example{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:12px;font-family:monospace;font-size:12px;color:var(--muted);overflow-x:auto;margin-top:12px}
.example span{color:var(--accent)}
.stats{display:flex;gap:16px;margin-top:24px}
.stat{text-align:center}
.stat-val{font-size:24px;font-weight:700;color:var(--accent)}
.stat-label{font-size:11px;color:var(--muted);margin-top:2px}
footer{text-align:center;margin-top:24px;color:var(--muted);font-size:11px}
</style>
</head>
<body>
<div class="container">
  <h1>Embed API</h1>
  <p class="subtitle">Free movie &amp; TV show embed service. Integrate with your site in minutes.</p>

  <div class="card">
    <h2>Endpoints</h2>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/embed/movie/:tmdb_id</span>
    </div>
    <p class="desc">Embed a movie player by TMDB ID</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/embed/tv/:tmdb_id/:season/:episode</span>
    </div>
    <p class="desc">Embed a TV episode player</p>

    <div class="endpoint">
      <span class="method">GET</span>
      <span class="path">/api/v1/sources?tmdb=:id</span>
    </div>
    <p class="desc">List available sources for a title</p>

    <div class="example">
      &lt;iframe src="<span>https://${config.embedDomain}/embed/movie/550</span>"<br>
      &nbsp;&nbsp;width="100%" height="100%"<br>
      &nbsp;&nbsp;allowfullscreen&gt;&lt;/iframe&gt;
    </div>
  </div>

  <div class="card">
    <h2>Features</h2>
    <ul style="list-style:none;font-size:13px;line-height:2">
      <li>&#x2714; Multiple server fallback</li>
      <li>&#x2714; Auto quality selection</li>
      <li>&#x2714; Mobile responsive player</li>
      <li>&#x2714; No API key required</li>
      <li>&#x2714; TMDB ID support</li>
    </ul>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-val">5</div><div class="stat-label">Servers</div></div>
    <div class="stat"><div class="stat-val">70K+</div><div class="stat-label">Movies</div></div>
    <div class="stat"><div class="stat-val">30K+</div><div class="stat-label">TV Shows</div></div>
  </div>

  <footer>Powered by TMDB. For educational purposes only.</footer>
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
