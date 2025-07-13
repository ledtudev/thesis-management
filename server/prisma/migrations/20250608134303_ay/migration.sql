/*
  Warnings:

  - You are about to drop the column `added_at` on the `report_attachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "report_attachment" DROP COLUMN "added_at",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
