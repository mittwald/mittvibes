-- CreateTable
CREATE TABLE "ExtensionInstance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contextId" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT NOT NULL,

    CONSTRAINT "ExtensionInstance_pkey" PRIMARY KEY ("id")
);