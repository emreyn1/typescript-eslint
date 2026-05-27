import { describe, expect, it, vi } from "vitest";
import {
	RetriableError,
	calculateBackoffDelay,
	composeMiddleware,
	createRetryMiddleware,
	getRetryDelayFromError,
	isRetriableError,
} from "./retry";

describe("isRetriableError", () => {
	it("returns true for RetriableError instances", () => {
		const error = new RetriableError("rate limited", 429);
		expect(isRetriableError(error)).toBe(true);
	});

	it("returns true for 429 status code", () => {
		const error = { status: 429, message: "Too Many Requests" };
		expect(isRetriableError(error)).toBe(true);
	});

	it("returns true for 5xx status codes", () => {
		expect(isRetriableError({ status: 500 })).toBe(true);
		expect(isRetriableError({ status: 502 })).toBe(true);
		expect(isRetriableError({ status: 503 })).toBe(true);
		expect(isRetriableError({ statusCode: 504 })).toBe(true);
	});

	it("returns false for 4xx status codes (except 429)", () => {
		expect(isRetriableError({ status: 400 })).toBe(false);
		expect(isRetriableError({ status: 401 })).toBe(false);
		expect(isRetriableError({ status: 403 })).toBe(false);
		expect(isRetriableError({ status: 404 })).toBe(false);
	});

	it("returns true for network error codes", () => {
		expect(isRetriableError({ code: "ECONNRESET" })).toBe(true);
		expect(isRetriableError({ code: "ECONNREFUSED" })).toBe(true);
		expect(isRetriableError({ code: "ETIMEDOUT" })).toBe(true);
		expect(isRetriableError({ code: "ENOTFOUND" })).toBe(true);
		expect(isRetriableError({ code: "EAI_AGAIN" })).toBe(true);
		expect(isRetriableError({ code: "EPIPE" })).toBe(true);
		expect(isRetriableError({ code: "EHOSTUNREACH" })).toBe(true);
		expect(isRetriableError({ code: "ENETUNREACH" })).toBe(true);
	});

	it("returns true for specific transient error messages", () => {
		expect(isRetriableError({ message: "rate limit exceeded" })).toBe(true);
		expect(isRetriableError({ message: "Too many requests" })).toBe(true);
		expect(isRetriableError({ message: "Service temporarily unavailable" })).toBe(true);
		expect(isRetriableError({ message: "service temporarily overloaded" })).toBe(true);
		expect(isRetriableError({ message: "server is temporarily overloaded" })).toBe(true);
		expect(isRetriableError({ message: "please retry your request" })).toBe(true);
		expect(isRetriableError({ message: "try again later" })).toBe(true);
	});

	it("returns false for permanent error messages that could be misclassified", () => {
		// These patterns were previously too broad and could match permanent errors
		expect(isRetriableError({ message: "model is at capacity" })).toBe(false);
		expect(isRetriableError({ message: "internal server error: unknown model" })).toBe(false);
		expect(isRetriableError({ message: "overloaded with requests for deprecated model" })).toBe(false);
		expect(isRetriableError({ message: "capacity reached for this model" })).toBe(false);
	});

	it("returns false for null/undefined", () => {
		expect(isRetriableError(null)).toBe(false);
		expect(isRetriableError(undefined)).toBe(false);
	});

	it("returns false for non-object errors", () => {
		expect(isRetriableError("error string")).toBe(false);
		expect(isRetriableError(123)).toBe(false);
	});
});

describe("getRetryDelayFromError", () => {
	it("returns retryAfterMs from RetriableError", () => {
		const error = new RetriableError("rate limited", 429, 5000);
		expect(getRetryDelayFromError(error)).toBe(5000);
	});

	it("returns undefined for RetriableError without retryAfterMs", () => {
		const error = new RetriableError("rate limited", 429);
		expect(getRetryDelayFromError(error)).toBeUndefined();
	});

	it("parses retry-after header (seconds)", () => {
		const error = { headers: { "retry-after": "5" } };
		expect(getRetryDelayFromError(error)).toBe(5000);
	});

	it("parses Retry-After header (capitalized)", () => {
		const error = { headers: { "Retry-After": "10" } };
		expect(getRetryDelayFromError(error)).toBe(10000);
	});

	it("parses x-ratelimit-reset header", () => {
		const error = { headers: { "x-ratelimit-reset": "3" } };
		expect(getRetryDelayFromError(error)).toBe(3000);
	});

	it("returns undefined for non-object errors", () => {
		expect(getRetryDelayFromError(null)).toBeUndefined();
		expect(getRetryDelayFromError(undefined)).toBeUndefined();
		expect(getRetryDelayFromError("error")).toBeUndefined();
	});

	it("returns undefined when no headers present", () => {
		expect(getRetryDelayFromError({ message: "error" })).toBeUndefined();
	});
});

describe("calculateBackoffDelay", () => {
	it("calculates exponential delay", () => {
		const baseDelay = 1000;
		const maxDelay = 30000;

		// With jitter, we can only test ranges
		const delay0 = calculateBackoffDelay(0, baseDelay, maxDelay);
		const delay1 = calculateBackoffDelay(1, baseDelay, maxDelay);
		const delay2 = calculateBackoffDelay(2, baseDelay, maxDelay);

		// Base delay * 2^attempt, with ±25% jitter
		expect(delay0).toBeGreaterThanOrEqual(750); // 1000 - 25%
		expect(delay0).toBeLessThanOrEqual(1250); // 1000 + 25%

		expect(delay1).toBeGreaterThanOrEqual(1500); // 2000 - 25%
		expect(delay1).toBeLessThanOrEqual(2500); // 2000 + 25%

		expect(delay2).toBeGreaterThanOrEqual(3000); // 4000 - 25%
		expect(delay2).toBeLessThanOrEqual(5000); // 4000 + 25%
	});

	it("caps delay at maxDelayMs", () => {
		const delay = calculateBackoffDelay(10, 1000, 5000);
		expect(delay).toBeLessThanOrEqual(5000);
	});

	it("never returns negative values", () => {
		const delay = calculateBackoffDelay(0, 0, 1000);
		expect(delay).toBeGreaterThanOrEqual(0);
	});
});

describe("createRetryMiddleware", () => {
	it("has v3 specification version", () => {
		const middleware = createRetryMiddleware();
		expect(middleware.specificationVersion).toBe("v3");
	});

	it("returns result on first successful attempt", async () => {
		const middleware = createRetryMiddleware();
		const mockResult = { stream: "mock-stream" };
		const doStream = vi.fn().mockResolvedValue(mockResult);

		const result = await middleware.wrapStream?.({
			doStream,
			params: {} as never,
			model: {} as never,
		});

		expect(result).toBe(mockResult);
		expect(doStream).toHaveBeenCalledTimes(1);
	});

	it("retries on retriable errors", async () => {
		const middleware = createRetryMiddleware({
			maxRetries: 2,
			baseDelayMs: 10,
			maxDelayMs: 100,
		});

		const mockResult = { stream: "mock-stream" };
		const doStream = vi
			.fn()
			.mockRejectedValueOnce({ status: 429 })
			.mockResolvedValue(mockResult);

		const result = await middleware.wrapStream?.({
			doStream,
			params: {} as never,
			model: {} as never,
		});

		expect(result).toBe(mockResult);
		expect(doStream).toHaveBeenCalledTimes(2);
	});

	it("throws immediately on non-retriable errors", async () => {
		const middleware = createRetryMiddleware({ maxRetries: 3 });
		const error = { status: 400, message: "Bad Request" };
		const doStream = vi.fn().mockRejectedValue(error);

		await expect(
			middleware.wrapStream?.({
				doStream,
				params: {} as never,
				model: {} as never,
			}),
		).rejects.toEqual(error);

		expect(doStream).toHaveBeenCalledTimes(1);
	});

	it("calls onRetryAttempt callback before each retry", async () => {
		const onRetryAttempt = vi.fn();
		const middleware = createRetryMiddleware({
			maxRetries: 2,
			baseDelayMs: 10,
			onRetryAttempt,
		});

		const doStream = vi
			.fn()
			.mockRejectedValueOnce({ status: 429 })
			.mockRejectedValueOnce({ status: 503 })
			.mockResolvedValue({ stream: "ok" });

		await middleware.wrapStream?.({
			doStream,
			params: {} as never,
			model: {} as never,
		});

		expect(onRetryAttempt).toHaveBeenCalledTimes(2);
		expect(onRetryAttempt).toHaveBeenNthCalledWith(1, 1, 2, expect.any(Number), { status: 429 });
		expect(onRetryAttempt).toHaveBeenNthCalledWith(2, 2, 2, expect.any(Number), { status: 503 });
	});

	it("throws after exhausting all retries", async () => {
		const middleware = createRetryMiddleware({
			maxRetries: 2,
			baseDelayMs: 10,
		});

		const error = { status: 429 };
		const doStream = vi.fn().mockRejectedValue(error);

		await expect(
			middleware.wrapStream?.({
				doStream,
				params: {} as never,
				model: {} as never,
			}),
		).rejects.toEqual(error);

		expect(doStream).toHaveBeenCalledTimes(3); // initial + 2 retries
	});

	it("respects retryAllErrors option", async () => {
		const middleware = createRetryMiddleware({
			maxRetries: 1,
			baseDelayMs: 10,
			retryAllErrors: true,
		});

		const mockResult = { stream: "ok" };
		const doStream = vi
			.fn()
			.mockRejectedValueOnce({ status: 400 }) // normally not retriable
			.mockResolvedValue(mockResult);

		const result = await middleware.wrapStream?.({
			doStream,
			params: {} as never,
			model: {} as never,
		});

		expect(result).toBe(mockResult);
		expect(doStream).toHaveBeenCalledTimes(2);
	});
});

describe("composeMiddleware", () => {
	it("has v3 specification version", () => {
		const composed = composeMiddleware();
		expect(composed.specificationVersion).toBe("v3");
	});

	it("composes transformParams in order", async () => {
		const calls: string[] = [];

		const middleware1 = {
			specificationVersion: "v3" as const,
			transformParams: async ({ params }: { params: { value: number } }) => {
				calls.push("m1");
				return { ...params, value: params.value + 1 };
			},
		};

		const middleware2 = {
			specificationVersion: "v3" as const,
			transformParams: async ({ params }: { params: { value: number } }) => {
				calls.push("m2");
				return { ...params, value: params.value * 2 };
			},
		};

		const composed = composeMiddleware(middleware1, middleware2);
		const result = await composed.transformParams?.({
			type: "stream",
			params: { value: 5 } as never,
			model: {} as never,
		});

		expect(calls).toEqual(["m1", "m2"]);
		expect((result as { value: number }).value).toBe(12); // (5 + 1) * 2
	});

	it("composes wrapStream in reverse order (first middleware innermost)", async () => {
		const calls: string[] = [];

		const middleware1 = {
			specificationVersion: "v3" as const,
			wrapStream: async ({ doStream }: { doStream: () => Promise<string> }) => {
				calls.push("m1-before");
				const result = await doStream();
				calls.push("m1-after");
				return result;
			},
		};

		const middleware2 = {
			specificationVersion: "v3" as const,
			wrapStream: async ({ doStream }: { doStream: () => Promise<string> }) => {
				calls.push("m2-before");
				const result = await doStream();
				calls.push("m2-after");
				return result;
			},
		};

		const composed = composeMiddleware(middleware1, middleware2);
		await composed.wrapStream?.({
			doStream: async () => {
				calls.push("doStream");
				return "result";
			},
			params: {} as never,
			model: {} as never,
		});

		// m1 is innermost, m2 is outermost
		expect(calls).toEqual(["m2-before", "m1-before", "doStream", "m1-after", "m2-after"]);
	});

	it("composes wrapGenerate in reverse order (first middleware innermost)", async () => {
		const calls: string[] = [];

		const middleware1 = {
			specificationVersion: "v3" as const,
			wrapGenerate: async ({ doGenerate }: { doGenerate: () => Promise<string> }) => {
				calls.push("m1-before");
				const result = await doGenerate();
				calls.push("m1-after");
				return result;
			},
		};

		const middleware2 = {
			specificationVersion: "v3" as const,
			wrapGenerate: async ({ doGenerate }: { doGenerate: () => Promise<string> }) => {
				calls.push("m2-before");
				const result = await doGenerate();
				calls.push("m2-after");
				return result;
			},
		};

		const composed = composeMiddleware(middleware1, middleware2);
		await composed.wrapGenerate?.({
			doGenerate: async () => {
				calls.push("doGenerate");
				return "result";
			},
			params: {} as never,
			model: {} as never,
		});

		// m1 is innermost, m2 is outermost
		expect(calls).toEqual(["m2-before", "m1-before", "doGenerate", "m1-after", "m2-after"]);
	});

	it("handles middlewares without wrapGenerate", async () => {
		const middleware1 = {
			specificationVersion: "v3" as const,
			wrapStream: async ({ doStream }: { doStream: () => Promise<string> }) => doStream(),
		};

		const middleware2 = {
			specificationVersion: "v3" as const,
			wrapGenerate: async ({ doGenerate }: { doGenerate: () => Promise<string> }) => {
				return doGenerate();
			},
		};

		const composed = composeMiddleware(middleware1, middleware2);

		const result = await composed.wrapGenerate?.({
			doGenerate: async () => "generated",
			params: {} as never,
			model: {} as never,
		});

		expect(result).toBe("generated");
	});

	it("handles empty middleware array", async () => {
		const composed = composeMiddleware();

		const streamResult = await composed.wrapStream?.({
			doStream: async () => "streamed",
			params: {} as never,
			model: {} as never,
		});

		const generateResult = await composed.wrapGenerate?.({
			doGenerate: async () => "generated",
			params: {} as never,
			model: {} as never,
		});

		expect(streamResult).toBe("streamed");
		expect(generateResult).toBe("generated");
	});
});
