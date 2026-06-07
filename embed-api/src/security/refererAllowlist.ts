/**
 * Referer / domain allowlist (hotlink protection) — a **pure, deterministic**
 * predicate that decides whether a request's `Referer`/`Origin` host is allowed
 * to embed the public surface (design component 12 §2).
 *
 * Policy (Req 13.5, 11.3):
 *   - **Empty allowlist ⇒ ALWAYS allowed.** This is the open, vidsrc.to-style
 *     broad-embedding default: hotlink protection is off and the predicate
 *     never rejects, regardless of the host (even `null`/missing).
 *   - **Non-empty allowlist ⇒ allowed iff** the host matches some allowlist
 *     entry under **exact-or-suffix** match: entry `"example.com"` matches host
 *     `"example.com"` and any subdomain `"sub.example.com"`, but NOT
 *     `"notexample.com"` (the suffix must align on a dot boundary). Matching is
 *     **case-insensitive**. A `null`/missing host can never match a non-empty
 *     allowlist, so it is refused.
 *
 * Both this predicate and the {@link refererHost} URL→host helper are pure and
 * deterministic — no clock, no I/O — so the predicate is property-testable
 * (Property 17).
 *
 * Requirements: 13.5 (hotlink allowlist), 11.3 (open-by-default broad embedding).
 */

/**
 * Normalize a host for comparison: trim, lower-case, strip a trailing dot
 * (the FQDN root, e.g. `"example.com."`), and drop any `:port` suffix so a
 * `Referer` host like `"example.com:443"` matches the bare allowlist entry.
 * Returns `null` when the input is empty after normalization.
 */
function normalizeHost(host: string | null | undefined): string | null {
  if (host === null || host === undefined) return null;
  let h = host.trim().toLowerCase();
  if (h === "") return null;
  // Strip a single trailing dot (absolute FQDN form).
  if (h.endsWith(".")) h = h.slice(0, -1);
  // Strip a port suffix if present (`host:port`). IPv6 literals are bracketed
  // (`[::1]:443`) so a lone colon only appears as a port separator here.
  const colon = h.lastIndexOf(":");
  if (colon !== -1 && !h.includes("[")) h = h.slice(0, colon);
  return h === "" ? null : h;
}

/**
 * Does `host` match allowlist `entry` under exact-or-suffix semantics?
 *
 * `entry` matches when the host equals it exactly, or the host ends with
 * `"." + entry` (a dot-bounded subdomain). Both sides are normalized first, so
 * matching is case-insensitive and tolerant of trailing dots / ports.
 */
function hostMatchesEntry(host: string, entry: string): boolean {
  const e = normalizeHost(entry);
  if (e === null) return false;
  return host === e || host.endsWith(`.${e}`);
}

/**
 * Pure referer/domain allowlist predicate.
 *
 * @param host      The `Referer`/`Origin` host to check (already extracted, or
 *                  use {@link refererHost} to pull it from a full URL). May be
 *                  `null`/`undefined` when the header is absent.
 * @param allowlist The configured allowlist (`config.refererAllowlist`).
 * @returns `true` if embedding is allowed. An **empty allowlist always returns
 *          `true`** (open-by-default, Req 11.3); a non-empty allowlist returns
 *          `true` iff some entry matches the host (exact or dot-bounded suffix,
 *          case-insensitive, Req 13.5).
 */
export function refererAllowed(
  host: string | null | undefined,
  allowlist: string[]
): boolean {
  // Open-by-default: no allowlist configured ⇒ never reject.
  if (allowlist.length === 0) return true;

  const normalized = normalizeHost(host);
  // A missing/blank host cannot satisfy a non-empty allowlist.
  if (normalized === null) return false;

  return allowlist.some((entry) => hostMatchesEntry(normalized, entry));
}

/**
 * Convenience helper: extract the host from a full `Referer`/`Origin` value.
 *
 * Accepts either a full URL (`"https://sub.example.com:443/path?q=1"`) or a
 * bare host (`"sub.example.com"`), returning the lower-cased host without any
 * port, or `null` when the input is empty/unparseable. Pure and deterministic.
 *
 * Pair with {@link refererAllowed}, e.g.
 * `refererAllowed(refererHost(req.headers.referer), config.refererAllowlist)`.
 */
export function refererHost(referer: string | null | undefined): string | null {
  if (referer === null || referer === undefined) return null;
  const raw = referer.trim();
  if (raw === "") return null;

  // Try to parse as a full URL first (handles scheme, port, path, query).
  try {
    return normalizeHost(new URL(raw).hostname);
  } catch {
    // Not a full URL — treat the value as a bare host (strip any port).
    return normalizeHost(raw);
  }
}
