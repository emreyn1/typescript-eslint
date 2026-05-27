/**
 * 10-level affiliate commission rates.
 * IMPORTANT: These must match the rates in supabase/migrations/001_initial_schema.sql
 * (v_level_rates array inside calculate_commissions function).
 * When changing rates, update BOTH this file AND the DB migration/function.
 */
export const COMMISSION_RATES = [
  0.10, // Level 1 — direct referral
  0.05, // Level 2
  0.03, // Level 3
  0.02, // Level 4
  0.02, // Level 5
  0.01, // Level 6
  0.01, // Level 7
  0.01, // Level 8
  0.01, // Level 9
  0.01, // Level 10
] as const

export const TOTAL_LEVELS = COMMISSION_RATES.length
export const TOTAL_COMMISSION_PERCENT = COMMISSION_RATES.reduce((a, b) => a + b, 0) * 100
