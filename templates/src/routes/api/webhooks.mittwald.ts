import { createServerFileRoute } from "@tanstack/react-start/server";
import { CombinedWebhookHandlerFactory } from "@weissaufschwarz/mitthooks/index";
import type {
	ExtensionStorage,
	ExtensionToBeAdded,
	ExtensionToBeUpdated,
} from "@weissaufschwarz/mitthooks/storage/extensionStorage";
import { db } from "~/db";
import { env } from "~/env";

class PrismaExtensionStorage implements ExtensionStorage {
	public async upsertExtension(extension: ExtensionToBeAdded): Promise<void> {
		try {
			await db.extensionInstance.upsert({
				where: {
					id: extension.extensionInstanceId,
				},
				update: {
					secret: extension.secret,
				},
				create: {
					id: extension.extensionInstanceId,
					contextId: extension.contextId,
					active: true,
					secret: extension.secret,
				},
			});
		} catch (error) {
			console.error(
				"Error while upserting extension in extension storage",
				error,
			);
			throw new Error("Failed to create or update extension instance");
		}
	}

	public async updateExtension(extension: ExtensionToBeUpdated): Promise<void> {
		try {
			await db.extensionInstance.update({
				where: {
					id: extension.extensionInstanceId,
				},
				data: {
					id: extension.extensionInstanceId,
					contextId: extension.contextId,
					active: extension.enabled,
				},
			});
		} catch (error) {
			console.error(
				"Error while updating extension in extension storage",
				error,
			);
			throw new Error("Failed to update extension instance");
		}
	}

	public async rotateSecret(
		extensionInstanceId: string,
		secret: string,
	): Promise<void> {
		try {
			await db.extensionInstance.update({
				where: {
					id: extensionInstanceId,
				},
				data: {
					id: extensionInstanceId,
					secret: secret,
				},
			});
		} catch (error) {
			console.error("Error while rotating secret in extension storage", error);
			throw new Error("Failed to rotate extension secret");
		}
	}
	public async removeInstance(extensionInstanceId: string): Promise<void> {
		try {
			await db.extensionInstance.delete({
				where: {
					id: extensionInstanceId,
				},
			});
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "P2025"
			) {
				// P2025 = Record to delete does not exist - don't throw error here for idempotency
				console.warn(
					"Extension instance to remove does not exist, skipping deletion",
				);
				return;
			}
			console.error(
				"Error while removing extension instance in extension storage",
				error,
			);
			throw new Error("Failed to remove extension instance");
		}
	}
}

export const ServerRoute = createServerFileRoute(
	"/api/webhooks/mittwald",
).methods({
	POST: async ({ request }) => {
		const combinedHandler = new CombinedWebhookHandlerFactory(
			new PrismaExtensionStorage(),
			env.EXTENSION_ID,
		).build();

		try {
			const rawBody = await request.text();
			const signatureSerial =
				request.headers.get("X-Marketplace-Signature-Serial") || "";
			const signatureAlgorithm =
				request.headers.get("X-Marketplace-Signature-Algorithm") || "";
			const signature = request.headers.get("X-Marketplace-Signature") || "";

			const webhookContent = {
				rawBody,
				signatureSerial,
				signatureAlgorithm,
				signature,
			};

			await combinedHandler(webhookContent);
		} catch (e) {
			console.error("Error while handling webhook", e);

			return new Response("Error handling webhook", {
				status: 400,
				statusText: "Bad Request",
			});
		}

		return new Response("Webhook handled successfully", {
			status: 200,
		});
	},
});
