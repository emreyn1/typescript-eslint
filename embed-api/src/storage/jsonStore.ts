/**
 * JSON-file storage backend (zero native dependencies).
 *
 * The smallest-footprint option: the latest provider report is stored as a
 * single JSON document at `config.healthReportPath`, and title source stats are
 * an appended array in a sibling file in the same directory
 * (`title-source-stats.json`). Suitable for single-node, read-mostly, low
 * write-volume deployments (design → Health Report Store; Resource Footprint
 * §1).
 *
 * Trade-off (documented in design): no concurrent-writer safety and no indexed
 * queries — acceptable at this write volume (a report per cron run, a row per
 * watch). Writes are serialized in-process so interleaved awaits from the same
 * process do not corrupt a file.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { config } from "../config.js";
import type {
  ProviderReport,
  Store,
  StoredTitleSourceStat,
  TitleSourceStat,
} from "./types.js";

/** Derive the sibling stats file path next to the report file. */
function statsPathFor(reportPath: string): string {
  return path.join(path.dirname(reportPath), "title-source-stats.json");
}

async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    if (raw.trim() === "") return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    // Missing file → fall back; anything else is a real error worth surfacing.
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export class JsonStore implements Store {
  readonly backend = "json" as const;

  private readonly reportPath: string;
  private readonly statsPath: string;
  /** Serializes file writes within this process to avoid corruption. */
  private writeChain: Promise<unknown> = Promise.resolve();

  constructor(
    reportPath: string = config.healthReportPath,
    statsPath: string = statsPathFor(config.healthReportPath)
  ) {
    this.reportPath = reportPath;
    this.statsPath = statsPath;
  }

  /** Queue `fn` so writes run one-at-a-time even under concurrent awaits. */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.writeChain.then(fn, fn);
    // Keep the chain alive but swallow rejections so one failure does not
    // poison every subsequent write.
    this.writeChain = next.catch(() => undefined);
    return next;
  }

  async saveReport(report: ProviderReport): Promise<void> {
    await this.enqueue(async () => {
      // "latest report = one object": keep the document with the greatest
      // generatedAt so getLatestReport() is correct regardless of save order.
      const existing = await readJsonFile<ProviderReport | null>(
        this.reportPath,
        null
      );
      if (existing && existing.generatedAt > report.generatedAt) return;
      await writeJsonFile(this.reportPath, report);
    });
  }

  async getLatestReport(): Promise<ProviderReport | null> {
    return readJsonFile<ProviderReport | null>(this.reportPath, null);
  }

  async recordTitleStats(stat: TitleSourceStat): Promise<void> {
    await this.enqueue(async () => {
      const rows = await readJsonFile<StoredTitleSourceStat[]>(
        this.statsPath,
        []
      );
      const nextId =
        rows.reduce((max, r) => (r.id > max ? r.id : max), 0) + 1;
      const stored: StoredTitleSourceStat = {
        id: nextId,
        tmdbId: stat.tmdbId,
        contentType: stat.contentType,
        season: stat.season ?? null,
        episode: stat.episode ?? null,
        sourceCount: stat.sourceCount,
        providers: stat.providers,
        recordedAt: stat.recordedAt ?? new Date().toISOString(),
      };
      rows.push(stored);
      await writeJsonFile(this.statsPath, rows);
    });
  }

  async listTitleStats(): Promise<StoredTitleSourceStat[]> {
    const rows = await readJsonFile<StoredTitleSourceStat[]>(this.statsPath, []);
    // Newest first (descending id), matching the SQL backends' ORDER BY.
    return [...rows].sort((a, b) => b.id - a.id);
  }

  async close(): Promise<void> {
    // No persistent handle — drain any in-flight writes before returning.
    await this.writeChain;
  }
}
