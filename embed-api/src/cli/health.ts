/**
 * Health CLI (design component 8, "Health CLI"; Req 3.3).
 *
 * A runnable Node entry point that runs provider Health_Checks across a set of
 * test titles and surfaces a {@link ProviderReport} in two forms:
 *
 *   - a **human-readable table** (provider, status, working/tested, reason), and
 *   - the same report as **machine-readable JSON** (so the output can be piped
 *     into other tooling or captured by CI).
 *
 * It also persists the report through the {@link HealthReportStore} (the same
 * store the authed `/admin/providers/report` endpoint reads), and chooses its
 * **process exit code** so the command is useful in cron/CI:
 *
 *   - exit `0`  — at least one provider is `healthy`.
 *   - exit `1`  — every provider is `unhealthy`/`unknown` (no healthy provider),
 *                 or there were no providers to report.
 *   - exit `2`  — the run could not start (missing/invalid `--titles` file, or
 *                 the health run itself threw).
 *
 * Usage:
 *
 * ```bash
 * node dist/cli/health.js --titles ./test-titles.json
 * # or, via the npm script:
 * npm run health:check -- --titles ./test-titles.json
 * ```
 *
 * The `--titles` argument is optional; it defaults to
 * `config.healthTestTitlesPath`. The titles file is a JSON array of
 * {@link TitleRef} objects, e.g.:
 *
 * ```json
 * [
 *   { "tmdbId": 603, "type": "movie" },
 *   { "tmdbId": 1399, "type": "tv", "season": 1, "episode": 1 }
 * ]
 * ```
 *
 * The module is split into a testable {@link runHealthCli} core (dependencies
 * injected) and a thin `main()` wrapper that wires the real
 * {@link HealthChecker} + default {@link healthReportStore}. An import guard at
 * the bottom ensures importing this module never runs the CLI — it only runs
 * when invoked directly as the process entry point.
 *
 * Requirements: 3.3.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { HealthChecker, type ProviderReport, type TitleRef } from "../health/checker.js";
import {
  healthReportStore,
  type HealthReportStore,
} from "../health/store.js";

/** Process exit codes the CLI uses (documented above). */
export const EXIT_OK = 0;
export const EXIT_NO_HEALTHY = 1;
export const EXIT_ERROR = 2;

/** Minimal logger surface so output can be captured/asserted in tests. */
export interface CliLogger {
  log: (msg: string) => void;
  error: (msg: string) => void;
}

/** Anything that can run a health sweep — {@link HealthChecker} satisfies this. */
export interface HealthRunner {
  runHealthChecks(titles: TitleRef[]): Promise<ProviderReport>;
}

/** Injectable dependencies for {@link runHealthCli}. */
export interface HealthCliDeps {
  /** Process args to parse (defaults to `process.argv.slice(2)`). */
  argv?: string[];
  /** The health runner (defaults to a real {@link HealthChecker}). */
  checker?: HealthRunner;
  /** Where to persist the report (defaults to the shared {@link healthReportStore}). */
  store?: HealthReportStore;
  /** Output sink (defaults to `console`). */
  logger?: CliLogger;
}

/**
 * Parse the `--titles` argument from a raw arg list. Supports both
 * `--titles <path>` and `--titles=<path>`. Returns `config.healthTestTitlesPath`
 * when the flag is absent.
 */
export function parseTitlesPath(argv: string[]): string {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--titles") {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) return next;
      return config.healthTestTitlesPath;
    }
    if (arg.startsWith("--titles=")) {
      const value = arg.slice("--titles=".length);
      if (value !== "") return value;
    }
  }
  return config.healthTestTitlesPath;
}

/**
 * Validate that an unknown JSON value is a non-empty array of {@link TitleRef}.
 * Throws an `Error` with a clear message describing the first problem found.
 */
export function parseTitles(raw: unknown, source: string): TitleRef[] {
  if (!Array.isArray(raw)) {
    throw new Error(
      `titles file "${source}" must contain a JSON array of titles, got ${describeType(raw)}`
    );
  }
  if (raw.length === 0) {
    throw new Error(`titles file "${source}" contains an empty array; add at least one title`);
  }

  return raw.map((entry, index) => validateTitle(entry, index, source));
}

/** Validate a single title entry. */
function validateTitle(entry: unknown, index: number, source: string): TitleRef {
  const at = `titles[${index}] in "${source}"`;
  if (typeof entry !== "object" || entry === null) {
    throw new Error(`${at} must be an object, got ${describeType(entry)}`);
  }

  const obj = entry as Record<string, unknown>;
  const { tmdbId, type, season, episode } = obj;

  if (typeof tmdbId !== "number" || !Number.isFinite(tmdbId)) {
    throw new Error(`${at} is missing a numeric "tmdbId"`);
  }
  if (type !== "movie" && type !== "tv") {
    throw new Error(`${at} must have "type" of "movie" or "tv"`);
  }
  if (type === "tv") {
    if (typeof season !== "number" || !Number.isFinite(season)) {
      throw new Error(`${at} is a tv title and must include a numeric "season"`);
    }
    if (typeof episode !== "number" || !Number.isFinite(episode)) {
      throw new Error(`${at} is a tv title and must include a numeric "episode"`);
    }
  }

  const title: TitleRef = { tmdbId, type };
  if (typeof season === "number" && Number.isFinite(season)) title.season = season;
  if (typeof episode === "number" && Number.isFinite(episode)) title.episode = episode;
  return title;
}

/** Human-friendly type description for error messages. */
function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Load + validate the test titles from a JSON file path. Throws a clear,
 * actionable `Error` when the file is missing, unreadable, not valid JSON, or
 * not a well-formed title array.
 */
export async function loadTitles(path: string): Promise<TitleRef[]> {
  let contents: string;
  try {
    contents = await readFile(path, "utf8");
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`could not read titles file "${path}": ${reason}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`titles file "${path}" is not valid JSON: ${reason}`);
  }

  return parseTitles(parsed, path);
}

/** Pad/truncate a cell to a fixed width for the text table. */
function cell(value: string, width: number): string {
  if (value.length > width) return value.slice(0, Math.max(0, width - 1)) + "…";
  return value.padEnd(width);
}

/**
 * Render a {@link ProviderReport} as a fixed-width, human-readable table with
 * the columns required by the design: provider, status, working/tested, reason.
 */
export function formatReportTable(report: ProviderReport): string {
  const headers = ["PROVIDER", "STATUS", "WORKING/TESTED", "REASON"];
  const widths = [24, 10, 16, 40];

  const lines: string[] = [];
  lines.push(headers.map((h, i) => cell(h, widths[i])).join("  ").trimEnd());
  lines.push(widths.map((w) => "-".repeat(w)).join("  "));

  if (report.providers.length === 0) {
    lines.push("(no providers were discovered or configured)");
  } else {
    for (const p of report.providers) {
      const name = p.providerName && p.providerName !== p.providerId
        ? `${p.providerName} (${p.providerId})`
        : p.providerId;
      const ratio = `${p.workingTitleCount}/${p.testedTitleCount}`;
      const reason = p.failureReason ?? "";
      lines.push(
        [
          cell(name, widths[0]),
          cell(p.status, widths[1]),
          cell(ratio, widths[2]),
          cell(reason, widths[3]),
        ]
          .join("  ")
          .trimEnd()
      );
    }
  }

  return lines.join("\n");
}

/**
 * Decide the process exit code from a report: `EXIT_OK` when at least one
 * provider is healthy, otherwise `EXIT_NO_HEALTHY` (every provider is
 * unhealthy/unknown, or there are no providers).
 */
export function exitCodeForReport(report: ProviderReport): number {
  const anyHealthy = report.providers.some((p) => p.status === "healthy");
  return anyHealthy ? EXIT_OK : EXIT_NO_HEALTHY;
}

/**
 * Testable CLI core. Parses `--titles`, loads + validates the titles, runs the
 * health sweep, prints the table and JSON, persists the report, and returns the
 * exit code. Never calls `process.exit` itself — the caller maps the return
 * value to an exit code.
 *
 * Returns `EXIT_ERROR` (with a clear message on `logger.error`) for any
 * startup/run failure (missing/invalid titles file, or the run throwing), so a
 * missing file degrades gracefully rather than crashing with a stack trace.
 */
export async function runHealthCli(deps: HealthCliDeps = {}): Promise<number> {
  const argv = deps.argv ?? process.argv.slice(2);
  const logger = deps.logger ?? { log: console.log, error: console.error };
  const checker = deps.checker ?? new HealthChecker();
  const store = deps.store ?? healthReportStore;

  const titlesPath = parseTitlesPath(argv);

  let titles: TitleRef[];
  try {
    titles = await loadTitles(titlesPath);
  } catch (err) {
    logger.error(`[health] ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_ERROR;
  }

  let report: ProviderReport;
  try {
    logger.error(
      `[health] running health checks for ${titles.length} title(s) from "${titlesPath}"…`
    );
    report = await checker.runHealthChecks(titles);
  } catch (err) {
    logger.error(`[health] health run failed: ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_ERROR;
  }

  // Human-readable table first…
  logger.log(formatReportTable(report));
  // …then the machine-readable JSON (a clear separator keeps them parseable).
  logger.log("");
  logger.log("--- JSON ---");
  logger.log(JSON.stringify(report, null, 2));

  // Persist the report (best-effort: a storage failure must not mask the
  // health result, but it should be reported).
  try {
    await store.saveReport(report);
  } catch (err) {
    logger.error(
      `[health] WARNING: failed to persist report: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const code = exitCodeForReport(report);
  if (code === EXIT_NO_HEALTHY) {
    logger.error(
      "[health] no healthy provider found (every provider is unhealthy/unknown)"
    );
  }
  return code;
}

/** Production entry point: run the CLI and map the result to a process exit. */
export async function main(): Promise<void> {
  const code = await runHealthCli();
  process.exit(code);
}

/**
 * Import guard: only run when this file is the process entry point, so
 * importing it (e.g. from tests or `cli/index.ts`) never triggers a health run.
 */
function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return fileURLToPath(import.meta.url) === entry;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  void main();
}
