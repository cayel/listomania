/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `List` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX "List_shareToken_key" ON "List"("shareToken");
