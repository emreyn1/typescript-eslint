// Unit tests for the /api/v1/* protection guard (task 10.10, Req 13.6).
// Covers the pure fingerprint extraction/validation helpers, client-IP
// derivation, and the preHandler's no-side-effect-on-reject behaviour
// (rate-limited → 429, bad fingerprint → 403). These are example/edge-case
// unit tests; the optional integration tests are task 10.11 (not implemented).

import { describe, it, expect } from "vitest";
import {
  apiV1Guard,
  clientIpOf,
  extractFingerprint,
  isValidFingerprint,
} from "./apiV1.js";
import type { RateLimiter } from "../security/index.js";
import type { FastifyReply, FastifyRequest } from "fastify";

// --- Test doubles -----------------------------------------------------------

/** A RateLimiter stub whose decision and behaviour we control per test. */
function fakeRateLimiter(behaviour: {
  allowed?: boolean;
  throws?: boolean;
}): { limiter: RateLimiter; keys: string[] } {
  const keys: string[] = [];
  const limiter = {
    async check(key: string) {
      keys.push(key);
      if (behaviour.throws) throw new Error("counter store down");
      return {
        allowed: behaviour.allowed ?? true,
        remaining: 0,
        resetAt: 0,
      };
    },
    async close() {},
  } as unknown as RateLimiter;
  return { limiter, keys };
}

/** A minimal Fastify reply double that records status + payload. */
function fakeReply(): FastifyReply & { _status: number; _payload: unknown } {
  const reply = {
    _status: 200,
    _payload: undefined as unknown,
    status(code: number) {
      this._status = code;
      return this;
    },
    async send(payload: unknown) {
      this._payload = payload;
      return this;
    },
  };
  return reply as unknown as FastifyReply & { _status: number; _payload: unknown };
}

/** Build a minimal request double. */
function fakeRequest(init: Partial<FastifyRequest>): FastifyRequest {
  return {
    ip: "127.0.0.1",
    headers: {},
    body: {},
    query: {},
    ...init,
  } as unknown as FastifyRequest;
}

// --- isValidFingerprint -----------------------------------------------------

describe("isValidFingerprint", () => {
  it("accepts a well-formed base36/alphanumeric fingerprint", () => {
    expect(isValidFingerprint("abc123xyz")).toBe(true);
    expect(isValidFingerprint("Aa0_9-Bb1234")).toBe(true);
  });

  it("rejects missing, empty, too-short, or oversized values", () => {
    expect(isValidFingerprint(null)).toBe(false);
    expect(isValidFingerprint(undefined)).toBe(false);
    expect(isValidFingerprint("")).toBe(false);
    expect(isValidFingerprint("short")).toBe(false); // < 8 chars
    expect(isValidFingerprint("a".repeat(129))).toBe(false); // > 128 chars
  });

  it("rejects values with disallowed characters", () => {
    expect(isValidFingerprint("has spaces!")).toBe(false);
    expect(isValidFingerprint("semi;colon;inj")).toBe(false);
    expect(isValidFingerprint("drop/table/now")).toBe(false);
  });
});

// --- extractFingerprint -----------------------------------------------------

describe("extractFingerprint", () => {
  it("reads from body.fingerprint, body.fp, query, then x-fingerprint header", () => {
    expect(
      extractFingerprint(fakeRequest({ body: { fingerprint: "fromBody" } }))
    ).toBe("fromBody");
    expect(extractFingerprint(fakeRequest({ body: { fp: "bodyFp" } }))).toBe(
      "bodyFp"
    );
    expect(
      extractFingerprint(fakeRequest({ query: { fp: "queryFp" } }))
    ).toBe("queryFp");
    expect(
      extractFingerprint(
        fakeRequest({ headers: { "x-fingerprint": "headerFp" } })
      )
    ).toBe("headerFp");
  });

  it("returns null when no fingerprint is present", () => {
    expect(extractFingerprint(fakeRequest({}))).toBeNull();
  });
});

// --- clientIpOf -------------------------------------------------------------

describe("clientIpOf", () => {
  it("prefers cf-connecting-ip, then x-forwarded-for, then req.ip", () => {
    expect(
      clientIpOf(fakeRequest({ headers: { "cf-connecting-ip": "1.2.3.4" } }))
    ).toBe("1.2.3.4");
    expect(
      clientIpOf(
        fakeRequest({ headers: { "x-forwarded-for": "5.6.7.8, 9.9.9.9" } })
      )
    ).toBe("5.6.7.8");
    expect(clientIpOf(fakeRequest({ ip: "10.0.0.1" }))).toBe("10.0.0.1");
  });
});

// --- apiV1Guard: no side effect on reject -----------------------------------

describe("apiV1Guard", () => {
  it("rejects over-budget requests with 429 and an api-scope key", async () => {
    const { limiter, keys } = fakeRateLimiter({ allowed: false });
    const guard = apiV1Guard(limiter);
    const reply = fakeReply();

    await guard(
      fakeRequest({ body: { fingerprint: "validfingerprint" } }),
      reply
    );

    expect(reply._status).toBe(429);
    expect((reply._payload as { error: string }).error).toBe("rate_limited");
    expect(keys[0]).toBe("api:ip:127.0.0.1");
  });

  it("fails closed to 429 when the counter store throws", async () => {
    const { limiter } = fakeRateLimiter({ throws: true });
    const guard = apiV1Guard(limiter);
    const reply = fakeReply();

    await guard(
      fakeRequest({ body: { fingerprint: "validfingerprint" } }),
      reply
    );

    expect(reply._status).toBe(429);
  });

  it("rejects a missing/invalid fingerprint with 403", async () => {
    const { limiter } = fakeRateLimiter({ allowed: true });
    const guard = apiV1Guard(limiter);
    const reply = fakeReply();

    await guard(fakeRequest({ body: {} }), reply);

    expect(reply._status).toBe(403);
    expect((reply._payload as { error: string }).error).toBe(
      "invalid_fingerprint"
    );
  });

  it("passes through (sends nothing) when both checks succeed", async () => {
    const { limiter } = fakeRateLimiter({ allowed: true });
    const guard = apiV1Guard(limiter);
    const reply = fakeReply();

    await guard(
      fakeRequest({ body: { fingerprint: "validfingerprint" } }),
      reply
    );

    // Guard did not short-circuit: status untouched, no payload sent, so the
    // route handler (the side effect) is free to run.
    expect(reply._status).toBe(200);
    expect(reply._payload).toBeUndefined();
  });
});
