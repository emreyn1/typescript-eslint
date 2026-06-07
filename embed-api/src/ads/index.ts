// Ad Insertion (public embed surface only): adConfigFor(policy) + the
// {{AD_BUMPER}} markup builder, wrapping the existing ads/bumper + VAST wiring.
// See ./insert.ts (design component 13; Req 12.1-12.4, 10.5).
export type { AdConfig } from "./insert.js";
export { adConfigFor, renderAdBumper } from "./insert.js";
