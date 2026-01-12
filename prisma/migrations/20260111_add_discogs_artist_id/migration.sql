-- AlterTable
ALTER TABLE "Album" ADD COLUMN "discogsArtistId" TEXT;

-- CreateIndex
CREATE INDEX "Album_discogsArtistId_idx" ON "Album"("discogsArtistId");

-- Nettoyer les noms d'artistes existants (retirer les numéros entre parenthèses)
UPDATE "Album" SET "artist" = REGEXP_REPLACE("artist", '\s*\(\d+\)\s*$', '', 'g');
