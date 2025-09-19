import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";
import { env } from "./env";

const createPrismaClient = () =>
	new PrismaClient({
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	}).$extends(
		fieldEncryptionExtension({
			encryptionKey: env.PRISMA_FIELD_ENCRYPTION_KEY,
		}),
	);

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

export type PrismaInstance = typeof db;

globalForPrisma.prisma = db;
