-- CreateTable
CREATE TABLE "GeneratedInterface" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "styles" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "reactCode" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedInterface_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GeneratedInterface" ADD CONSTRAINT "GeneratedInterface_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedInterface" ADD CONSTRAINT "GeneratedInterface_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
