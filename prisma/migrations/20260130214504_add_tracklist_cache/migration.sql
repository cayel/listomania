-- CreateTable
CREATE TABLE "AlbumTracklist" (
    "id" TEXT NOT NULL,
    "discogsId" TEXT NOT NULL,
    "discogsType" TEXT NOT NULL,
    "tracklist" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumTracklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlbumTracklist_discogsId_discogsType_idx" ON "AlbumTracklist"("discogsId", "discogsType");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumTracklist_discogsId_discogsType_key" ON "AlbumTracklist"("discogsId", "discogsType");
