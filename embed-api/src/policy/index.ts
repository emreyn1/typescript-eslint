// Policy Resolver — single source of truth mapping route prefix to a
// SurfacePolicy (ads / abuse controls / CDN-cache). Implemented in resolve.ts.
export type { Surface, SurfacePolicy, RoutePrefix } from "./resolve.js";
export { resolvePolicy } from "./resolve.js";
