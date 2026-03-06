/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChatUsage` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `ChatUsage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChatUsage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,day]` on the table `ChatUsage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `ChatUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ChatUsage_userId_month_idx";

-- DropIndex
DROP INDEX "ChatUsage_userId_month_key";

-- AlterTable
ALTER TABLE "ChatUsage" DROP COLUMN "createdAt",
DROP COLUMN "month",
DROP COLUMN "updatedAt",
ADD COLUMN     "day" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ChatUsage_userId_day_idx" ON "ChatUsage"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ChatUsage_userId_day_key" ON "ChatUsage"("userId", "day");
