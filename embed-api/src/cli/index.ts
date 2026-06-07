// CLI entry points (e.g. `health:check`).
// The health CLI (task 8.11) exposes a testable core plus helpers; re-exported
// here so callers can `import { runHealthCli } from "./cli/index.js"`.
export {
  runHealthCli,
  main as runHealthMain,
  parseTitlesPath,
  parseTitles,
  loadTitles,
  formatReportTable,
  exitCodeForReport,
  EXIT_OK,
  EXIT_NO_HEALTHY,
  EXIT_ERROR,
  type HealthCliDeps,
  type HealthRunner,
  type CliLogger,
} from "./health.js";

// Health cron scheduler (task 19.1): runs the health sweep off-peak on
// `config.healthCronSchedule`, never per request.
export {
  HealthCronScheduler,
  defaultHealthRunner,
  main as runScheduler,
  parseCronExpression,
  parseCronField,
  cronMatches,
  nextRun,
  type CronSchedule,
  type SchedulerClock,
  type HealthSweepRunner,
  type SchedulerLogger,
  type HealthCronSchedulerDeps,
} from "./scheduler.js";
