import { getConfig, getSessionToken } from "@mittwald/ext-bridge/browser";
import { verify } from "@mittwald/ext-bridge/node";
import { createMiddleware } from "@tanstack/react-start";

export const verifyAccessToInstance = createMiddleware({
	type: "function",
	validateClient: true,
})
	.client(async ({ next }) => {
		const sessionToken = await getSessionToken();
		const config = await getConfig();

		return next({
			sendContext: {
				sessionToken,
				projectId: config.projectId,
			},
		});
	})
	.server(async ({ next, context }) => {
		const res = await verify(context.sessionToken);

		return next({
			context: {
				extensionInstanceId: res.extensionInstanceId,
				extensionId: res.extensionId,
				userId: res.userId,
				contextId: res.contextId,
				projectId: context.projectId,
			},
		});
	});
