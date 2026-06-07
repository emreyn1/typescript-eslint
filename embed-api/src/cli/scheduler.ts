/**
 * Health cron scheduler (design "Deployment" + Resource Footprint §4; Req 8.x).
 *
 * Runs the provider Health_Check sweep (`HealthChecker.runHealthChecks` + save
 * via the {@link HealthReportStore}) on a **low-frequency, off-peak cron**
 * (`config.healthCronSchedule`, default `0 4 * * *` — daily at 04:00), and
 * **never per request**. Keeping the sweep on a timer (rather than wiring it
 * into any HTTP handler) is what guarantees it cannot compete with live
 * playback for CPU/egress on a cheap VPS (Resource Footprint §4).
 *
 * The scheduler is deliberately dependency-light: rather than pulling in a
 * heavy cron package, it ships a tiny, self-contained 5-field cron-expression
 * evaluator (`minute hour day-of-month month day-of-week`) and drives itself
 * with a single `setTimeout` that re-arms after each tick. The supported
 * syntax covers the common cases:
 *
 *   - `*`            — every value in the field
 *   - `5`            — a specific value
 *   - `1,15,30`      — a list
 *   - `1-5`          — an inclusive range
 *   - `* / 15`       — a step over the whole range (written without spaces)
 *   - `0-30/5`       — a step over a range
 *   - day-of-week `0` or `7` both mean Sunday
 *
 * When both day-of-month and day-of-week are restricted (neither is `*`), a
 * tick matches if **either** matches (standard Vixie-cron OR semantics).
 *
 * Everything time-related is injectable — the clock (`now`) and the timer
 * (`setTimer`/`clearTimer`) and the work to run (`runner`) — so the scheduler
 * is fully testable with a fake clock and a stub runner, with no real waiting
 * and no network.
 *
 * Run it as a process:
 *
 * ```bash
 * node dist/cli/scheduler.js                 # uses HEALTH_CRON_SCHEDULE
 * # or via npm:
 * npm run health:cron
 * ```
 *
 * An import guard at the bottom ensures importing this module never starts a
 * scheduler — it only runs when invoked directly as the process entry point.
 *
 * Requirements: Resource Footprint §3/§4 (off-peak, never per request); the
 * scheduler executes the same health sweep the CLI (task 8.11) runs.
 */
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { HealthChecker, type ProviderReport, type TitleRef } from "../health/checker.js";
import { healthReportStore, type HealthReportStore } from "../health/store.js";
import { loadTitles } from "./health.js";

/** Number of fields in a standard cron expression. */
const CRON_FIELD_COUNT = 5;
/** `setTimeout` accepts at most a signed 32-bit delay (~24.8 days). */
const MAX_TIMEOUT_MS = 2_147_483_647;
/** Safety bound when searching for the next matching minute (~370 days). */
const MAX_SEARCH_MINUTES = 370 * 24 * 60;

/**
 * A parsed cron schedule: each field is the explicit set of allowed integer
 * values, plus a flag recording whether the day-of-month / day-of-week field
 * was a wildcard (needed for the OR semantics).
 */
export interface CronSchedule {
  minutes: Set<number>;
  hours: Set<number>;
  daysOfMonth: Set<number>;
  months: Set<number>;
  daysOfWeek: Set<number>;
  /** True when the day-of-month field was `*` (unrestricted). */
  domUnrestricted: boolean;
  /** True when the day-of-week field was `*` (unrestricted). */
  dowUnrestricted: boolean;
}

interface FieldSpec {
  min: number;
  max: number;
}

const FIELD_SPECS: FieldSpec[] = [
  { min: 0, max: 59 }, // minute
  { min: 0, max: 23 }, // hour
  { min: 1, max: 31 }, // day of month
  { min: 1, max: 12 }, // month
  { min: 0, max: 7 }, // day of week (0 and 7 = Sunday)
];

/**
 * Parse a single cron field (e.g. `*`, `5`, `1,15`, `1-5`, `* / 15`, `0-30/5`)
 * into the explicit set of allowed values within `[spec.min, spec.max]`.
 * Throws on malformed input so a bad `HEALTH_CRON_SCHEDULE` fails loudly at
 * parse time rather than silently never firing.
 */
export function parseCronField(field: string, spec: FieldSpec): Set<number> {
  const values = new Set<number>();

  for (const part of field.split(",")) {
    const token = part.trim();
    if (token === "") throw new Error(`empty cron field segment in "${field}"`);

    // Split off an optional step ("*/5", "1-10/2").
    const [rangePart, stepPart] = token.split("/");
    let step = 1;
    if (stepPart !== undefined) {
      step = Number(stepPart);
      if (!Number.isInteger(step) || step <= 0) {
        throw new Error(`invalid step "${stepPart}" in cron field "${field}"`);
      }
    }

    let lo: number;
    let hi: number;
    if (rangePart === "*") {
      lo = spec.min;
      hi = spec.max;
    } else if (rangePart.includes("-")) {
      const [loStr, hiStr] = rangePart.split("-");
      lo = Number(loStr);
      hi = Number(hiStr);
      if (!Number.isInteger(lo) || !Number.isInteger(hi)) {
        throw new Error(`invalid range "${rangePart}" in cron field "${field}"`);
      }
    } else {
      lo = Number(rangePart);
      hi = lo;
      if (!Number.isInteger(lo)) {
        throw new Error(`invalid value "${rangePart}" in cron field "${field}"`);
      }
    }

    if (lo < spec.min || hi > spec.max || lo > hi) {
      throw new Error(
        `cron field "${field}" out of range [${spec.min}-${spec.max}]`
      );
    }

    for (let v = lo; v <= hi; v += step) values.add(v);
  }

  return values;
}

/**
 * Parse a full 5-field cron expression into a {@link CronSchedule}. Day-of-week
 * `7` is normalized to `0` (Sunday) so matching only needs to check `0`.
 */
export function parseCronExpression(expr: string): CronSchedule {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== CRON_FIELD_COUNT) {
    throw new Error(
      `cron expression "${expr}" must have ${CRON_FIELD_COUNT} fields, got ${fields.length}`
    );
  }

  const minutes = parseCronField(fields[0], FIELD_SPECS[0]);
  const hours = parseCronField(fields[1], FIELD_SPECS[1]);
  const daysOfMonth = parseCronField(fields[2], FIELD_SPECS[2]);
  const months = parseCronField(fields[3], FIELD_SPECS[3]);
  const daysOfWeekRaw = parseCronField(fields[4], FIELD_SPECS[4]);

  // Normalize day-of-week 7 → 0 (both mean Sunday).
  const daysOfWeek = new Set<number>();
  for (const d of daysOfWeekRaw) daysOfWeek.add(d === 7 ? 0 : d);

  return {
    minutes,
    hours,
    daysOfMonth,
    months,
    daysOfWeek,
    domUnrestricted: fields[2].trim() === "*",
    dowUnrestricted: fields[4].trim() === "*",
  };
}

/**
 * Does the given local-time `date` (to the minute) satisfy the schedule?
 * Implements Vixie-cron day matching: when both DOM and DOW are restricted, a
 * match on **either** is sufficient; otherwise both restricted fields must hold.
 */
export function cronMatches(schedule: CronSchedule, date: Date): boolean {
  if (!schedule.minutes.has(date.getMinutes())) return false;
  if (!schedule.hours.has(date.getHours())) return false;
  if (!schedule.months.has(date.getMonth() + 1)) return false;

  const domMatch = schedule.daysOfMonth.has(date.getDate());
  const dowMatch = schedule.daysOfWeek.has(date.getDay());

  if (schedule.domUnrestricted && schedule.dowUnrestricted) return true;
  if (!schedule.domUnrestricted && !schedule.dowUnrestricted) {
    return domMatch || dowMatch;
  }
  // Exactly one of DOM/DOW is restricted — that one must match.
  return schedule.domUnrestricted ? dowMatch : domMatch;
}

/**
 * Find the next `Date` strictly after `from` (rounded up to the next whole
 * minute) that matches `schedule`. Scans minute-by-minute with a safety bound
 * so an impossible expression (e.g. Feb 30) throws instead of looping forever.
 */
export function nextRun(schedule: CronSchedule, from: Date): Date {
  // Start at the next whole minute after `from` (seconds/ms cleared).
  const candidate = new Date(from.getTime());
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  for (let i = 0; i < MAX_SEARCH_MINUTES; i += 1) {
    if (cronMatches(schedule, candidate)) return new Date(candidate.getTime());
    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  throw new Error(
    "could not find a matching time within ~370 days; cron expression may be impossible"
  );
}

/** A timer handle — opaque; whatever `setTimer` returns. */
export type TimerHandle = unknown;

/** Injectable clock + timer so the scheduler is testable without real waits. */
export interface SchedulerClock {
  /** Current time. Defaults to `() => new Date()`. */
  now: () => Date;
  /** Schedule `fn` after `ms`. Defaults to global `setTimeout`. */
  setTimer: (fn: () => void, ms: number) => TimerHandle;
  /** Cancel a pending timer. Defaults to global `clearTimeout`. */
  clearTimer: (handle: TimerHandle) => void;
}

/** Runs one health sweep and persists it. {@link defaultHealthRunner} is the prod impl. */
export interface HealthSweepRunner {
  run(): Promise<ProviderReport>;
}

/** Minimal logger surface so output can be captured in tests. */
export interface SchedulerLogger {
  log: (msg: string) => void;
  error: (msg: string) => void;
}

/** Options for {@link HealthCronScheduler}. */
export interface HealthCronSchedulerDeps {
  /** Cron expression. Defaults to `config.healthCronSchedule`. */
  schedule?: string;
  /** The work to run on each tick. Defaults to {@link defaultHealthRunner}. */
  runner?: HealthSweepRunner;
  /** Injectable clock/timer. Defaults to real `Date`/`setTimeout`. */
  clock?: Partial<SchedulerClock>;
  /** Output sink. Defaults to `console`. */
  logger?: SchedulerLogger;
}

/**
 * Schedules and runs the health sweep on a cron, re-arming after each tick.
 *
 * Drives itself with a single timer that fires at the next matching minute;
 * because `setTimeout` caps at ~24.8 days, long gaps are handled by sleeping in
 * capped chunks and re-checking. The sweep runs **only** on the timer — there
 * is no per-request path into it (Resource Footprint §4).
 */
export class HealthCronScheduler {
  private readonly schedule: CronSchedule;
  private readonly scheduleExpr: string;
  private readonly runner: HealthSweepRunner;
  private readonly clock: SchedulerClock;
  private readonly logger: SchedulerLogger;

  private timer: TimerHandle | null = null;
  private running = false;
  private stopped = false;
  /** Resolves after the most recent tick's work settles (test hook). */
  private tickSettled: Promise<void> = Promise.resolve();

  constructor(deps: HealthCronSchedulerDeps = {}) {
    this.scheduleExpr = deps.schedule ?? config.healthCronSchedule;
    this.schedule = parseCronExpression(this.scheduleExpr);
    this.runner = deps.runner ?? defaultHealthRunner;
    this.clock = {
      now: deps.clock?.now ?? (() => new Date()),
      setTimer: deps.clock?.setTimer ?? ((fn, ms) => setTimeout(fn, ms)),
      clearTimer: deps.clock?.clearTimer ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>)),
    };
    this.logger = deps.logger ?? { log: console.log, error: console.error };
  }

  /** Arm the scheduler for its next run. Idempotent while already started. */
  start(): void {
    this.stopped = false;
    this.arm();
  }

  /** Cancel any pending timer and stop re-arming. */
  stop(): void {
    this.stopped = true;
    if (this.timer !== null) {
      this.clock.clearTimer(this.timer);
      this.timer = null;
    }
  }

  /**
   * Resolves once the most recently fired tick's async work has settled. Test
   * hook so a fake-clock test can `await` the sweep without real timers.
   */
  whenIdle(): Promise<void> {
    return this.tickSettled;
  }

  /** The next time the sweep will run from `now`, for logging/inspection. */
  nextRunAt(): Date {
    return nextRun(this.schedule, this.clock.now());
  }

  /** Compute the delay to the next run and schedule a (possibly capped) timer. */
  private arm(): void {
    if (this.stopped) return;

    const now = this.clock.now();
    const next = nextRun(this.schedule, now);
    const fullDelay = next.getTime() - now.getTime();
    const delay = Math.min(Math.max(fullDelay, 0), MAX_TIMEOUT_MS);
    const capped = fullDelay > MAX_TIMEOUT_MS;

    if (!capped) {
      this.logger.log(
        `[scheduler] next health sweep at ${next.toISOString()} ` +
          `(in ${Math.round(fullDelay / 1000)}s, cron "${this.scheduleExpr}")`
      );
    }

    this.timer = this.clock.setTimer(() => {
      // If the real delay exceeded the timer cap, this was just a chunk — keep
      // sleeping toward the target without running the sweep yet.
      if (capped) {
        this.arm();
        return;
      }
      this.fire();
    }, delay);
  }

  /** Execute one sweep, then re-arm for the following run. */
  private fire(): void {
    if (this.running) {
      // A previous sweep is still going (very slow run vs. a tight schedule);
      // skip this tick rather than overlap, and re-arm for the next slot.
      this.logger.error("[scheduler] previous health sweep still running; skipping this tick");
      this.arm();
      return;
    }

    this.running = true;
    this.tickSettled = (async () => {
      const startedAt = this.clock.now().toISOString();
      this.logger.log(`[scheduler] health sweep started at ${startedAt}`);
      try {
        const report = await this.runner.run();
        const healthy = report.providers.filter((p) => p.status === "healthy").length;
        this.logger.log(
          `[scheduler] health sweep complete: ${healthy}/${report.providers.length} providers healthy`
        );
      } catch (err) {
        this.logger.error(
          `[scheduler] health sweep failed: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        this.running = false;
        this.arm();
      }
    })();
  }
}

/**
 * Default production sweep runner: loads the configured test titles, runs the
 * full {@link HealthChecker} sweep, and persists the report via the shared
 * {@link HealthReportStore} — the same store the authed report endpoint reads.
 */
export const defaultHealthRunner: HealthSweepRunner = {
  async run(): Promise<ProviderReport> {
    const titles: TitleRef[] = await loadTitles(config.healthTestTitlesPath);
    const checker = new HealthChecker();
    const report = await checker.runHealthChecks(titles);
    const store: HealthReportStore = healthReportStore;
    await store.saveReport(report);
    return report;
  },
};

/**
 * Production entry point: build the scheduler with default wiring, start it,
 * and keep the process alive. Stops cleanly on SIGINT/SIGTERM.
 */
export function main(): void {
  const scheduler = new HealthCronScheduler();
  scheduler.start();

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[scheduler] received ${signal}, stopping`);
    scheduler.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

/**
 * Import guard: only run when this file is the process entry point, so
 * importing it (from tests or `cli/index.ts`) never starts a scheduler.
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
  main();
}
