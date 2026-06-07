/**
 * Legacy Torrent_Pipeline barrel (design component 10, "Legacy Torrent Pipeline").
 *
 * Re-exports the retained-but-dormant legacy resolver. The pipeline is OFF BY
 * DEFAULT — `resolveContent` short-circuits to `null` unless
 * `config.torrentPipelineEnabled === true` (Req 9.2, 9.3) — and is kept in the
 * tree solely so it can be re-enabled via configuration (Req 9.4). The
 * aggregator is the default resolution source for `/watch` and `/embed`
 * (Req 9.1); nothing on those routes imports this module.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4.
 */

// Gated resolver entry points + the default-off gate predicate (task 17.1).
export {
  resolveContent,
  processFromTorrent,
  torrentPipelineEnabled,
  buildR2Prefix,
} from "./catalog.js";
export type { ContentInfo, ResolveResult } from "./catalog.js";

// Retained torrent-discovery helpers (YTS / EZTV / Real-Debrid).
export {
  getImdbId,
  findYtsTorrents,
  findEztvTorrents,
  unrestrictWithDebrid,
  resolveMovieTorrent,
  resolveTvTorrent,
} from "./torrent.js";
export type { TorrentRef, ResolvedTorrent } from "./torrent.js";
