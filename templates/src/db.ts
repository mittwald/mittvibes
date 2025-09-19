import { PrismaClient } from "@prisma/client";
import { FieldEncryptionMiddleware } from "prisma-field-encryption";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

// Enable field encryption
db.$use(FieldEncryptionMiddleware(env.PRISMA_FIELD_ENCRYPTION_KEY));

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;