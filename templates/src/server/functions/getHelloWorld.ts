import { createServerFn } from "@tanstack/react-start";
import { verifyAccessToInstance } from "~/middlewares/verify-access-to-instance";

export const getHelloWorld = createServerFn({ method: "GET" })
	.middleware([verifyAccessToInstance])
	.handler(async ({ context }) => {
		// This is an example server function
		// You can access the verified context here
		const { extensionInstanceId, userId, contextId } = context;

		return {
			message: "Hello World from your mittwald Extension!",
			extensionInstanceId,
			userId,
			contextId,
			timestamp: new Date().toISOString(),
		};
	});
