// Stream protection: HMAC stream-token (Session_Token) sign/verify, plus the
// existing fingerprint / anti-debug script primitives.
//
// Task 13.1 (embed-omss-backend): the stream-token sign/verify primitives.
export {
  signStreamToken,
  verifyStreamToken,
} from "./streamToken.js";
export type { StreamToken, VerifyResult } from "./streamToken.js";

// Existing fingerprint / anti-debug client-script primitives injected into the
// player template (Req 4.7; the `_fp` cookie backs the /stream gate, Req 13.3).
export { fingerprintScript, antiDebugScript } from "./fingerprint.js";
