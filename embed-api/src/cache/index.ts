// Resolution + Manifest Cache: OMSS resolution cache (expiresAt-aware,
// request coalescing) and the cache-control header matrix. Filled in by task 12.
export type { ResponseKind } from "./cacheControl.js";
export { cacheControlFor } from "./cacheControl.js";

export type { TitleKey, TitleType } from "./resolution.js";
export { ResolutionCache, resolutionCache, titleKeyToString } from "./resolution.js";
