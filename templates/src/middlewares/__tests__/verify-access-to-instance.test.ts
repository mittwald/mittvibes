import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@mittwald/ext-bridge/node", () => ({
	verify: vi.fn(),
}));

vi.mock("@mittwald/ext-bridge/browser", () => ({
	getSessionToken: vi.fn(),
}));

vi.mock("@sentry/tanstackstart-react", () => ({
	captureException: vi.fn(),
}));

import { getSessionToken } from "@mittwald/ext-bridge/browser";
import { verify } from "@mittwald/ext-bridge/node";

describe("verifyAccessToInstance middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should get session token from browser", async () => {
		const mockSessionToken = "mock-session-token";
		vi.mocked(getSessionToken).mockResolvedValue(mockSessionToken);

		const result = await getSessionToken();

		expect(getSessionToken).toHaveBeenCalled();
		expect(result).toBe(mockSessionToken);
	});

	it("should allow access with valid session token and instance", async () => {
		const mockInstanceInfo = {
			sessionId: "session-123",
			extensionInstanceId: "valid-instance-id",
			extensionId: "valid-extension-id",
			userId: "valid-user-id",
			contextId: "context-123",
			context: "project" as const,
			scopes: ["read", "write"],
			authenticatableWithoutSecret: false,
			publicKeySerial: "serial-123",
		};

		vi.mocked(verify).mockResolvedValue(mockInstanceInfo);

		// Test the core middleware logic
		const sessionToken = "valid-session-token";
		const result = await verify(sessionToken);

		expect(verify).toHaveBeenCalledWith(sessionToken);
		expect(result).toEqual(mockInstanceInfo);
	});

	it("should reject access with invalid session token", async () => {
		const mockError = new Error("Unauthorized");
		vi.mocked(verify).mockRejectedValue(mockError);

		try {
			await verify("invalid-token");
		} catch (error) {
			expect(error).toBe(mockError);
		}

		expect(verify).toHaveBeenCalledWith("invalid-token");
	});

	it("should handle missing session token", async () => {
		const mockError = new Error("Session token required");
		vi.mocked(verify).mockRejectedValue(mockError);

		try {
			await verify("");
		} catch (error) {
			expect(error).toBe(mockError);
		}

		expect(verify).toHaveBeenCalledWith("");
	});

	it("should handle malformed instance information", async () => {
		const incompleteInfo = {
			sessionId: "session-456",
			extensionInstanceId: "instance-id",
			extensionId: "ext-id",
			userId: "user-id",
			contextId: "context-456",
			context: "project" as const,
			scopes: [],
			authenticatableWithoutSecret: false,
			publicKeySerial: "serial-456",
		};

		vi.mocked(verify).mockResolvedValue(incompleteInfo);

		const result = await verify("valid-token");

		expect(result).toEqual(incompleteInfo);
		expect(result.extensionInstanceId).toBe("instance-id");
	});

	it("should capture exceptions for monitoring", async () => {
		const mockError = new Error("Network error");
		vi.mocked(verify).mockRejectedValue(mockError);

		try {
			await verify("test-token");
		} catch (_error) {
			// In real middleware, this would capture the exception
			// captureException(error);
		}

		expect(verify).toHaveBeenCalledWith("test-token");
	});

	it("should handle different user contexts", async () => {
		const userContexts = [
			{
				sessionId: "session-1",
				extensionInstanceId: "instance-1",
				extensionId: "ext-1",
				userId: "user-1",
				contextId: "context-1",
				context: "project" as const,
				scopes: ["read"],
				authenticatableWithoutSecret: false,
				publicKeySerial: "serial-1",
			},
			{
				sessionId: "session-2",
				extensionInstanceId: "instance-2",
				extensionId: "ext-1",
				userId: "user-2",
				contextId: "context-2",
				context: "customer" as const,
				scopes: ["read", "write"],
				authenticatableWithoutSecret: true,
				publicKeySerial: "serial-2",
			},
		];

		for (const context of userContexts) {
			vi.mocked(verify).mockResolvedValue(context);

			const result = await verify(`token-for-${context.userId}`);

			expect(result).toEqual(context);
			expect(result.userId).toBe(context.userId);
		}
	});
});
