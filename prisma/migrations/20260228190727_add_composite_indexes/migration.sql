-- CreateIndex
CREATE INDEX "List_userId_isPublic_idx" ON "List"("userId", "isPublic");

-- CreateIndex
CREATE INDEX "List_isPublic_updatedAt_idx" ON "List"("isPublic", "updatedAt");

-- CreateIndex
CREATE INDEX "List_period_idx" ON "List"("period");
